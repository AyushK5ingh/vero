import { openai } from "@inngest/agent-kit";

export const githubOpenAI = openai({
  apiKey: process.env.GITHUB_TOKEN!,
  baseUrl: "https://models.github.ai/inference",
  model: "phi-3-mini-4k-instruct",


  defaultParameters: {
    temperature: 0.1,
  },
});