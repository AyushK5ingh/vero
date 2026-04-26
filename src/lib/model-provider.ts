type ProviderKeySource = "AWS_API_KEY" | "AI_API_KEY";

export interface ModelProviderConfig {
  apiKey: string;
  apiKeySource: ProviderKeySource;
  model: string;
  baseUrl: string;
}

function validateModelBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "Invalid AI base URL. Set AI_BASE_URL (or AWS_MODELS_BASE_URL) to a valid HTTPS URL.",
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      "Invalid AI base URL. HTTPS is required for AI_BASE_URL/AWS_MODELS_BASE_URL.",
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host.includes("your-bedrock-endpoint") ||
    host.includes("your-bedrock-openai-compatible-endpoint") ||
    host.includes("your-openai-compatible-endpoint")
  ) {
    throw new Error(
      "AI_BASE_URL is still a placeholder. Set it to your real Bedrock OpenAI-compatible endpoint.",
    );
  }

  return trimmed;
}

function getApiKeySource(): ProviderKeySource | null {
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const awsApiKey = process.env.AWS_API_KEY?.trim();

  if (aiApiKey && awsApiKey && aiApiKey !== awsApiKey) {
    throw new Error(
      "Conflicting model API keys detected. Set only AI_API_KEY (preferred) or ensure AWS_API_KEY matches it exactly.",
    );
  }

  // Deterministic policy: AI_API_KEY is canonical; AWS_API_KEY remains a legacy alias.
  if (aiApiKey) {
    return "AI_API_KEY";
  }

  if (awsApiKey) {
    return "AWS_API_KEY";
  }

  return null;
}

export function getModelProviderConfig(): ModelProviderConfig {
  const source = getApiKeySource();

  if (!source) {
    throw new Error(
      "Missing model API key. Set AI_API_KEY (preferred) or AWS_API_KEY.",
    );
  }

  const apiKey = process.env[source]?.trim();

  if (!apiKey) {
    throw new Error(
      "Model API key was resolved but not readable from process.env.",
    );
  }

  const model =
    process.env.AI_MODEL ||
    process.env.AWS_MODEL ||
    "meta.llama3-70b-instruct-v1:0";

  const baseUrl =
    source === "AWS_API_KEY"
      ? process.env.AWS_MODELS_BASE_URL || process.env.AI_BASE_URL || ""
      : source === "AI_API_KEY"
        ? process.env.AI_BASE_URL || process.env.AWS_MODELS_BASE_URL || ""
        : "";

  if (!baseUrl) {
    throw new Error(
      `Missing model base URL for ${source}. Set AI_BASE_URL (preferred) or AWS_MODELS_BASE_URL.`,
    );
  }

  const validatedBaseUrl = validateModelBaseUrl(baseUrl);

  return {
    apiKey,
    apiKeySource: source,
    model,
    baseUrl: validatedBaseUrl,
  };
}

export function getAuthorizationHeaderValue(apiKey: string) {
  const scheme = process.env.AI_AUTH_SCHEME || "Bearer";
  return `${scheme} ${apiKey}`.trim();
}
