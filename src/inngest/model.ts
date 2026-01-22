import { openai } from "@inngest/agent-kit";

export const githubOpenAI = openai({
  apiKey: process.env.OPENAI_API_KEY!,
  baseUrl: "https://models.github.ai/inference",
  model: "openai/gpt-4.1",
  defaultParameters: {
    temperature: 0.1,
  },
});