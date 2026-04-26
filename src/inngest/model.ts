import type { AiAdapter } from "@inngest/ai";
import { getModelProviderConfig } from "@/lib/model-provider";

export function getBedrockModel(): AiAdapter.Any {
  const config = getModelProviderConfig();

  console.log("[bedrockModel] API key source:", config.apiKeySource);
  console.log("[bedrockModel] Using model:", config.model);
  console.log("[bedrockModel] Base URL:", config.baseUrl);

  const baseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl
    : `${config.baseUrl}/`;

  return {
    url: new URL("chat/completions", baseUrl).href,
    authKey: config.apiKey,
    format: "openai-chat",
    "~types": {
      input: {} as Record<string, unknown>,
      output: {} as Record<string, unknown>,
    },
    onCall(model: AiAdapter, body: any) {
      body.temperature = 0.1;
      body.model ||= config.model;
    },
    options: {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      defaultParameters: {
        temperature: 0.1,
      },
    },
  } as unknown as AiAdapter.Any;
}
