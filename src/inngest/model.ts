import { openai } from "@inngest/agent-kit";

export const githubOpenAI = (() => {
  const token = process.env.GITHUB_TOKEN;
  const model = process.env.GITHUB_MODEL || "openai/gpt-4.1-mini";
  const baseUrl =
    process.env.GITHUB_MODELS_BASE_URL || "https://models.github.ai/inference";

  console.log("[githubOpenAI] GITHUB_TOKEN present:", !!token);
  console.log("[githubOpenAI] Using model:", model);

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is missing from environment variables. Set it before running code-agent.",
    );
  }

  return openai({
    apiKey: token,
    baseUrl,
    model,
    defaultParameters: {
      temperature: 0.1,
    },
  });
})();
