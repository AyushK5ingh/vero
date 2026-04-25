type ProviderKeySource = "AWS_API_KEY" | "AI_API_KEY" | "GITHUB_TOKEN";

export interface ModelProviderConfig {
  apiKey: string;
  apiKeySource: ProviderKeySource;
  model: string;
  baseUrl: string;
}

function getApiKeySource(): ProviderKeySource | null {
  if (process.env.AWS_API_KEY) {
    return "AWS_API_KEY";
  }

  if (process.env.AI_API_KEY) {
    return "AI_API_KEY";
  }

  if (process.env.GITHUB_TOKEN) {
    return "GITHUB_TOKEN";
  }

  return null;
}

export function getModelProviderConfig(): ModelProviderConfig {
  const source = getApiKeySource();

  if (!source) {
    throw new Error(
      "Missing model API key. Set AWS_API_KEY (preferred), AI_API_KEY, or GITHUB_TOKEN.",
    );
  }

  const apiKey = process.env[source];

  if (!apiKey) {
    throw new Error(
      "Model API key was resolved but not readable from process.env.",
    );
  }

  const model =
    process.env.AWS_MODEL ||
    process.env.AI_MODEL ||
    process.env.GITHUB_MODEL ||
    "openai/gpt-4.1-mini";

  const baseUrl =
    process.env.AWS_MODELS_BASE_URL ||
    process.env.AI_BASE_URL ||
    process.env.GITHUB_MODELS_BASE_URL ||
    "https://models.github.ai/inference";

  return {
    apiKey,
    apiKeySource: source,
    model,
    baseUrl,
  };
}

export function getAuthorizationHeaderValue(apiKey: string) {
  const scheme = process.env.AI_AUTH_SCHEME || "Bearer";
  return `${scheme} ${apiKey}`.trim();
}
