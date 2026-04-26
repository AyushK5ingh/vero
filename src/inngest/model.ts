import { openai } from "@inngest/agent-kit";
import { getModelProviderConfig } from "@/lib/model-provider";

export const bedrockModel = (() => {
  const config = getModelProviderConfig();

  console.log("[bedrockModel] API key source:", config.apiKeySource);
  console.log("[bedrockModel] Using model:", config.model);
  console.log("[bedrockModel] Base URL:", config.baseUrl);

  return openai({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    defaultParameters: {
      temperature: 0.1,
    },
  });
})();
