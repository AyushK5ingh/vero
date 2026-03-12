import { openai } from "@inngest/agent-kit";

export const githubOpenAI = (() => {
  const token = process.env.GITHUB_TOKEN;
  console.log("[githubOpenAI] GITHUB_TOKEN present:", !!token);
  
  if (!token) {
    console.error("[githubOpenAI] Error: GITHUB_TOKEN is missing from environment variables.");
  }

  return openai({
    apiKey: token!,
    baseUrl: "https://models.github.ai/inference",
    model: "phi-3-mini-4k-instruct",
    defaultParameters: {
      temperature: 0.1,
    },
  });
})();