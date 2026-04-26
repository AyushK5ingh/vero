import "server-only";

const DEFAULT_BEDROCK_MODEL = "meta.llama3-70b-instruct-v1:0";
const DEFAULT_BEDROCK_REGION = "ap-south-1";

export interface BedrockClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  region: string;
  authScheme: string;
}

export interface BedrockGenerateTextInput {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface BedrockGenerateTextOutput {
  text: string;
  model: string;
}

class BedrockRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "BedrockRequestError";
  }
}

function redactSensitiveText(input: string): string {
  return input
    .replace(/(authorization["']?\s*[:=]\s*["']?)(bearer\s+)?[^\s"',}]+/gi, "$1[REDACTED]")
    .replace(/(x-api-key["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, "$1[REDACTED]")
    .replace(/(api[_-]?key["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, "$1[REDACTED]");
}

export class BedrockAuthError extends BedrockRequestError {
  constructor(message: string, responseBody?: string) {
    super(message, 401, responseBody);
    this.name = "BedrockAuthError";
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function getChatCompletionsUrl(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized.endsWith("/v1")
    ? `${normalized}/chat/completions`
    : `${normalized}/v1/chat/completions`;
}

export function getBedrockClientConfig(): BedrockClientConfig {
  const apiKey = process.env.AI_API_KEY?.trim() || "";
  const baseUrl = process.env.AI_BASE_URL?.trim() || "";
  const model = process.env.AI_MODEL?.trim() || DEFAULT_BEDROCK_MODEL;
  const region = process.env.AWS_REGION?.trim() || DEFAULT_BEDROCK_REGION;
  const authScheme = process.env.AI_AUTH_SCHEME?.trim() || "Bearer";

  if (!apiKey) {
    throw new Error("Missing AI_API_KEY for AWS Bedrock.");
  }

  if (!baseUrl) {
    throw new Error("Missing AI_BASE_URL for AWS Bedrock.");
  }

  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error(
      "Invalid AI_BASE_URL. Provide a valid HTTPS URL for your Bedrock gateway.",
    );
  }

  if (parsedBaseUrl.protocol !== "https:") {
    throw new Error("Invalid AI_BASE_URL. HTTPS is required.");
  }

  const host = parsedBaseUrl.hostname.toLowerCase();
  if (
    host.includes("your-bedrock-endpoint") ||
    host.includes("your-bedrock-openai-compatible-endpoint")
  ) {
    throw new Error(
      "AI_BASE_URL is still a placeholder. Set it to your real AWS Bedrock gateway endpoint.",
    );
  }

  return {
    apiKey,
    baseUrl,
    model,
    region,
    authScheme,
  };
}

export async function generateBedrockText(
  input: BedrockGenerateTextInput,
): Promise<BedrockGenerateTextOutput> {
  const config = getBedrockClientConfig();

  const response = await fetch(getChatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${config.authScheme} ${config.apiKey}`.trim(),
      "x-amz-region": config.region,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        ...(input.systemPrompt
          ? [{ role: "system", content: input.systemPrompt }]
          : []),
        { role: "user", content: input.prompt },
      ],
      max_tokens: input.maxTokens ?? 1024,
      temperature: input.temperature ?? 0.2,
    }),
  });

  const rawBody = await response.text();
  const safeBody = redactSensitiveText(rawBody);

  if (response.status === 401) {
    throw new BedrockAuthError(
      "AWS Bedrock authentication failed (401 Unauthorized). Ensure AI_API_KEY is set in production and valid.",
      safeBody,
    );
  }

  if (!response.ok) {
    throw new BedrockRequestError(
      `AWS Bedrock request failed with status ${response.status}.`,
      response.status,
      safeBody,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new BedrockRequestError(
      "AWS Bedrock returned a non-JSON response.",
      response.status,
      safeBody,
    );
  }

  const candidate =
    typeof parsed === "object" && parsed !== null
      ? (
          parsed as {
            choices?: Array<{ message?: { content?: string } }>;
          }
        ).choices?.[0]?.message?.content
      : undefined;

  const text = typeof candidate === "string" ? candidate.trim() : "";
  if (!text) {
    throw new BedrockRequestError(
      "AWS Bedrock response did not contain assistant text.",
      response.status,
      safeBody,
    );
  }

  return {
    text,
    model: config.model,
  };
}
