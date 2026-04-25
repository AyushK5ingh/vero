import { openai } from "@inngest/agent-kit";
import { getModelProviderConfig } from "@/lib/model-provider";

export const githubOpenAI = (() => {
  const config = getModelProviderConfig();

  console.log("[githubOpenAI] API key source:", config.apiKeySource);
  console.log("[githubOpenAI] Using model:", config.model);
  console.log("[githubOpenAI] Base URL:", config.baseUrl);

  return openai({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    defaultParameters: {
      temperature: 0.1,
    },
  });
})();
