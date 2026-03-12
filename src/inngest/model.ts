import { openai } from "@inngest/agent-kit";

export const githubOpenAI = openai({
  apiKey: process.env.GITHUB_TOKEN!,
  baseUrl: "https://models.github.ai/inference",
  model: "gpt-4o",

  defaultParameters: {
    temperature: 0.1,
  },
});