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
import {
  getAuthorizationHeaderValue,
  getModelProviderConfig,
} from "@/lib/model-provider";
// import { auth, clerkClient } from "@clerk/nextjs/server";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    retries: 2,
    triggers: [{ event: "code-agent/run" }],
  },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      console.log("[codeAgentFunction] Creating sandbox...");
      const apiKey = process.env.E2B_API_KEY;
      const template = process.env.E2B_TEMPLATE;

      if (!apiKey) {
        throw new Error(
          "E2B_API_KEY is missing. Set it in Vercel project environment variables.",
        );
      }

      try {
        const sandbox = template
          ? await Sandbox.create(template, { apiKey })
          : await Sandbox.create({ apiKey });
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

        // If a configured template is invalid/missing, try E2B's default template.
        if (template) {
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
              `Sandbox creation failed for configured template \"${template}\" and default template. ${fallbackMessage}`,
            );
          }
        }

        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Sandbox creation failed using E2B default template: ${message}`,
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

    // Use the event ID as a deterministic nonce so that agent/network names
    // remain stable across Inngest retries (step memoization requires
    // consistent step IDs, which agent-kit derives from these names).
    const runNonce = event.data.projectId || event.id || "default";

    // Pre-flight: verify the model API is reachable before starting the
    // expensive agent network.  This surfaces auth / model-name / rate-limit
    // errors immediately instead of after multiple step.ai retries.
    await step.run("preflight-model-check", async () => {
      const config = getModelProviderConfig();

      const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;

      console.log(
        "[preflight] Testing model API at:",
        url,
        "model:",
        config.model,
      );
      console.log("[preflight] API key source:", config.apiKeySource);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthorizationHeaderValue(config.apiKey),
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Model API preflight failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`,
        );
      }

      console.log("[preflight] Model API is reachable ✓");
      return true;
    });

    console.log("[codeAgentFunction] Initializing agent network...");

    const codeAgent = createAgent<AgentState>({
      name: `code-agent-main-${runNonce}`,
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
                  timeoutMs: 240000,
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
      name: `code-agent-network-main-${runNonce}`,
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
    try {
      console.log(
        "[codeAgentFunction] Starting network.run() with nonce:",
        runNonce,
      );
      const result = await network.run(event.data.value, { state });
      console.log(
        "[codeAgentFunction] Network run complete. Summary length:",
        result.state.data.summary?.length || 0,
      );

      const previewStatus = await step.run(
        "ensure-preview-server",
        async () => {
          const sandbox = await getSandbox(sandboxId);

          const probe = await sandbox.commands.run(
            'sh -c "if command -v curl >/dev/null 2>&1 && curl -fs --max-time 2 http://127.0.0.1:3000 >/dev/null 2>&1; then echo READY; else echo CLOSED; fi"',
            {
              timeoutMs: 10000,
            },
          );

          if ((probe.stdout || "").includes("READY")) {
            console.log(
              "[codeAgentFunction] Preview server already running on port 3000",
            );
            return { ready: true, logs: "" };
          }

          console.log(
            "[codeAgentFunction] Starting preview server on port 3000...",
          );

          const projectRootResult = await sandbox.commands.run(
            'sh -c "ROOT=; for d in /home/user /workspace /app /home/user/app /home/user/project /tmp; do if [ -f \"$d/package.json\" ]; then ROOT=\"$d\"; break; fi; done; if [ -z \"$ROOT\" ]; then PKG=$(find /home /workspace /app /tmp -maxdepth 8 -name package.json 2>/dev/null | head -n 1); if [ -n \"$PKG\" ]; then ROOT=$(dirname \"$PKG\"); fi; fi; if [ -z \"$ROOT\" ]; then APPFILE=$(find /home /workspace /app /tmp -maxdepth 8 \( -path \"*/app/page.tsx\" -o -path \"*/app/layout.tsx\" \) 2>/dev/null | head -n 1); if [ -n \"$APPFILE\" ]; then ROOT=$(dirname $(dirname \"$APPFILE\")); fi; fi; echo \"$ROOT\""',
            {
              timeoutMs: 10000,
            },
          );

          let projectRoot = (projectRootResult.stdout || "")
            .trim()
            .split("\n")
            .at(-1)
            ?.trim();

          if (!projectRoot) {
            projectRoot = "/home/user";
          }

          const quotedRoot = JSON.stringify(projectRoot);

          const hasPackageJsonResult = await sandbox.commands.run(
            `sh -c "if [ -f ${quotedRoot}/package.json ]; then echo HAS_PKG; else echo NO_PKG; fi"`,
            {
              timeoutMs: 10000,
            },
          );

          const hasPackageJson = (hasPackageJsonResult.stdout || "").includes(
            "HAS_PKG",
          );

          if (!hasPackageJson) {
            console.log(
              "[codeAgentFunction] No package.json found. Bootstrapping minimal Next.js app at:",
              projectRoot,
            );

            await sandbox.commands.run(`sh -c "mkdir -p ${quotedRoot}/app"`, {
              timeoutMs: 10000,
            });

            await sandbox.files.write(
              `${projectRoot}/package.json`,
              JSON.stringify(
                {
                  name: "sandbox-app",
                  private: true,
                  scripts: {
                    dev: "next dev",
                    build: "next build",
                    start: "next start",
                  },
                  dependencies: {
                    next: "15.3.3",
                    react: "19.0.0",
                    "react-dom": "19.0.0",
                  },
                  devDependencies: {
                    typescript: "^5.6.3",
                    "@types/node": "^22.10.2",
                    "@types/react": "^19.0.1",
                    "@types/react-dom": "^19.0.2",
                  },
                },
                null,
                2,
              ),
            );

            const hasLayoutResult = await sandbox.commands.run(
              `sh -c "if [ -f ${quotedRoot}/app/layout.tsx ] || [ -f ${quotedRoot}/src/app/layout.tsx ]; then echo HAS_LAYOUT; else echo NO_LAYOUT; fi"`,
              {
                timeoutMs: 10000,
              },
            );

            if (!(hasLayoutResult.stdout || "").includes("HAS_LAYOUT")) {
              await sandbox.files.write(
                `${projectRoot}/app/layout.tsx`,
                'export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n',
              );
            }

            const hasPageResult = await sandbox.commands.run(
              `sh -c "if [ -f ${quotedRoot}/app/page.tsx ] || [ -f ${quotedRoot}/src/app/page.tsx ]; then echo HAS_PAGE; else echo NO_PAGE; fi"`,
              {
                timeoutMs: 10000,
              },
            );

            if (!(hasPageResult.stdout || "").includes("HAS_PAGE")) {
              await sandbox.files.write(
                `${projectRoot}/app/page.tsx`,
                "export default function Page() {\n  return <main style={{ padding: 24 }}>Sandbox Ready</main>;\n}\n",
              );
            }
          }

          await sandbox.commands.run(
            `sh -c "cd ${quotedRoot} && if [ -f pnpm-lock.yaml ]; then nohup sh -c \\\"pnpm install --no-frozen-lockfile && pnpm dev --host 0.0.0.0 --port 3000\\\" >/tmp/preview-server.log 2>&1 & elif [ -f package-lock.json ]; then nohup sh -c \\\"npm install --yes && npm run dev -- --hostname 0.0.0.0 --port 3000\\\" >/tmp/preview-server.log 2>&1 & elif [ -f yarn.lock ]; then nohup sh -c \\\"yarn install && yarn dev --host 0.0.0.0 --port 3000\\\" >/tmp/preview-server.log 2>&1 & else nohup sh -c \\\"npm install --yes && npm run dev -- --hostname 0.0.0.0 --port 3000\\\" >/tmp/preview-server.log 2>&1 & fi"`,
            {
              timeoutMs: 30000,
            },
          );

          const waitResult = await sandbox.commands.run(
            'sh -c "for n in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120; do if command -v curl >/dev/null 2>&1 && curl -fs --max-time 2 http://127.0.0.1:3000 >/dev/null 2>&1; then echo READY; break; fi; sleep 1; done; if ! command -v curl >/dev/null 2>&1 || ! curl -fs --max-time 2 http://127.0.0.1:3000 >/dev/null 2>&1; then echo FAILED; tail -n 120 /tmp/preview-server.log || true; fi"',
            {
              timeoutMs: 240000,
            },
          );

          const logs = `${waitResult.stdout || ""}\n${waitResult.stderr || ""}`;
          return {
            ready: (waitResult.stdout || "").includes("READY"),
            logs,
          };
        },
      );

      if (!previewStatus.ready) {
        throw new Error(
          `Preview server failed to start on port 3000. Logs:\n${previewStatus.logs || ""}`,
        );
      }

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
        console.log(
          "[codeAgentFunction] Getting sandbox URL for ID:",
          sandboxId,
        );
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : "";

      // Surface actionable hints for common failures
      let aiGatewayHint = message;
      if (message.includes("status code: 404")) {
        aiGatewayHint =
          "AI gateway returned 404. Verify BEDROCK_API_KEY (or AWS_API_KEY / AI_API_KEY / GITHUB_TOKEN fallback), and set BEDROCK_MODEL (or AWS_MODEL / AI_MODEL / GITHUB_MODEL) to a valid model id.";
      } else if (message.includes("rate limit") || message.includes("429")) {
        aiGatewayHint =
          "Rate limited by the AI provider. Wait a moment and try again.";
      } else if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        aiGatewayHint =
          "Request timed out reaching the AI provider. Check your network or try again.";
      }

      console.error(
        "[codeAgentFunction] Agent execution failed:",
        message,
        "\nStack:",
        stack,
      );

      await step.run("save-error-result", async () => {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: `Code generation failed: ${aiGatewayHint}`,
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      });

      return {
        url: null,
        title: "Error",
        files: {},
        summary: "",
      };
    }
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
