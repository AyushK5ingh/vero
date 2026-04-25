import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import {
  getSandbox,
  lastAssistantTextMessageContent,
  parseAgentOutput,
} from "./utils";
import {
  createAgent,
  createNetwork,
  createTool,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import { githubOpenAI } from "./model";
import { string, z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "./prompt";
import { prisma } from "@/lib/prisma";
// import { auth, clerkClient } from "@clerk/nextjs/server";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: [{ event: "code-agent/run" }],
  },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      console.log("[codeAgentFunction] Creating sandbox...");
      const apiKey = process.env.E2B_API_KEY;
      const template = process.env.E2B_TEMPLATE ?? "nextjs-demo-1274";

      if (!apiKey) {
        throw new Error(
          "E2B_API_KEY is missing. Set it in Vercel project environment variables.",
        );
      }

      try {
        const sandbox = await Sandbox.create(template, { apiKey });
        console.log(
          "[codeAgentFunction] Sandbox created with ID:",
          sandbox.sandboxId,
        );
        return sandbox.sandboxId;
      } catch (error) {
        console.error(
          "[codeAgentFunction] Failed to create sandbox with template:",
          template,
          error,
        );

        // If the built-in fallback template was removed/renamed, try E2B default template.
        if (!process.env.E2B_TEMPLATE) {
          try {
            const sandbox = await Sandbox.create({ apiKey });
            console.warn(
              "[codeAgentFunction] Fallback to default E2B template succeeded with sandbox ID:",
              sandbox.sandboxId,
            );
            return sandbox.sandboxId;
          } catch (fallbackError) {
            const fallbackMessage =
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError);
            throw new Error(
              `Sandbox creation failed for template \"${template}\" and default template. ${fallbackMessage}`,
            );
          }
        }

        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Sandbox creation failed for template \"${template}\": ${message}`,
        );
      }
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessages.reverse();
      },
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      },
    );

    console.log("[codeAgentFunction] Initializing agent network...");

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: githubOpenAI,
      tools: [
        createTool({
          name: "Terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: string(),
          }),
          handler: async ({ command }, { step }) => {
            return step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              },
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read a file from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    console.log(
      "[codeAgentFunction] Running network for input:",
      event.data.value,
    );
    const result = await network.run(event.data.value, { state });
    console.log(
      "[codeAgentFunction] Network run complete. Summary length:",
      result.state.data.summary?.length || 0,
    );

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: githubOpenAI,
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: githubOpenAI,
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary,
    );

    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary,
    );

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      console.log("[codeAgentFunction] Getting sandbox URL for ID:", sandboxId);
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      const url = `https://${host}`;
      console.log("[codeAgentFunction] Sandbox URL:", url);
      return url;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: parseAgentOutput(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOutput),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);

// export const deploymentAgentFunction = inngest.createFunction(
//   { id : "Deploy-Code-Agent"},
//   { event : "Deploy-Code-Agent/run"},
//   async({event , steps}) => {
//     const { userId } = await auth()
//       if (!userId) {
//            return;
//       }
//       // @ts-ignore
//     const user = await clerkClient.users.getUser(userId)
//       // @ts-ignore
//     const githubTokens = await clerkClient.users.getUserOauthAccessToken(userId, "github");

//     console.log(user , githubTokens)
//   }
// )
