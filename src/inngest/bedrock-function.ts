import { NonRetriableError } from "inngest";
import { z } from "zod";
import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { BedrockAuthError, generateBedrockText } from "@/lib/bedrock-client";

const BedrockGenerationEventSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1).max(10000),
  systemPrompt: z.string().max(4000).optional(),
});

export const bedrockGenerateFunction = inngest.createFunction(
  {
    id: "bedrock-generate",
    retries: 1,
    triggers: [{ event: "bedrock/generate.requested" }],
  },
  async ({ event, step }) => {
    const input = await step.run("validate-event", async () => {
      return BedrockGenerationEventSchema.parse(event.data);
    });

    const project = await step.run("verify-project", async () => {
      return prisma.project.findUnique({
        where: { id: input.projectId },
        select: { id: true },
      });
    });

    if (!project) {
      throw new NonRetriableError(
        `Project ${input.projectId} not found for Bedrock generation event.`,
      );
    }

    try {
      const generation = await step.run("generate-bedrock-text", async () => {
        return generateBedrockText({
          prompt: input.prompt,
          systemPrompt:
            input.systemPrompt ||
            "You are a production coding assistant powered by AWS Bedrock.",
          maxTokens: 1200,
          temperature: 0.2,
        });
      });

      const message = await step.run("save-bedrock-result", async () => {
        return prisma.message.create({
          data: {
            projectId: input.projectId,
            content: generation.text,
            role: "ASSISTANT",
            type: "RESULT",
          },
        });
      });

      return {
        projectId: input.projectId,
        messageId: message.id,
        model: generation.model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (error instanceof BedrockAuthError) {
        const authMessage =
          "AWS Bedrock authentication failed (401 Unauthorized). The Bedrock API key is missing in production or invalid.";

        console.error("[bedrock-generate]", authMessage, {
          detail: message,
        });

        await step.run("save-bedrock-auth-error", async () => {
          return prisma.message.create({
            data: {
              projectId: input.projectId,
              content: authMessage,
              role: "ASSISTANT",
              type: "ERROR",
            },
          });
        });

        throw new NonRetriableError(authMessage);
      }

      await step.run("save-bedrock-generic-error", async () => {
        return prisma.message.create({
          data: {
            projectId: input.projectId,
            content: `Bedrock generation failed: ${message}`,
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      });

      throw error;
    }
  },
);
