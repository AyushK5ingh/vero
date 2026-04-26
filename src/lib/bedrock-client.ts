import "server-only";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";

const DEFAULT_BEDROCK_MODEL = "meta.llama3-70b-instruct-v1:0";
const DEFAULT_BEDROCK_REGION = "ap-south-1";

export interface BedrockClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  region: string;
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

export class BedrockAuthError extends BedrockRequestError {
  constructor(message: string, responseBody?: string) {
    super(message, 401, responseBody);
    this.name = "BedrockAuthError";
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function getBedrockClientConfig(): BedrockClientConfig {
  const apiKey = process.env.AI_API_KEY?.trim() || "";
  const baseUrl = process.env.AI_BASE_URL?.trim() || "";
  const model = process.env.AI_MODEL?.trim() || DEFAULT_BEDROCK_MODEL;
  const region = process.env.AWS_REGION?.trim() || DEFAULT_BEDROCK_REGION;

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
    host.includes("your-bedrock-api-endpoint")
  ) {
    throw new Error(
      "AI_BASE_URL is still a placeholder. Set it to your real AWS Bedrock endpoint.",
    );
  }

  return {
    apiKey,
    baseUrl,
    model,
    region,
  };
}

export async function generateBedrockText(
  input: BedrockGenerateTextInput,
): Promise<BedrockGenerateTextOutput> {
  const config = getBedrockClientConfig();

  const bedrockProvider = createAmazonBedrock({
    apiKey: config.apiKey,
    region: config.region,
    baseURL: normalizeBaseUrl(config.baseUrl),
  });

  try {
    const result = await generateText({
      model: bedrockProvider(config.model),
      system: input.systemPrompt,
      prompt: input.prompt,
      maxOutputTokens: input.maxTokens ?? 1024,
      temperature: input.temperature ?? 0.2,
    });

    const text = result.text.trim();

    if (!text) {
      throw new BedrockRequestError(
        "AWS Bedrock response did not contain assistant text.",
        502,
      );
    }

    return {
      text,
      model: config.model,
    };
  } catch (error) {
    if (
      error instanceof BedrockAuthError ||
      error instanceof BedrockRequestError
    ) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    if (/401|unauthori[sz]ed/i.test(message)) {
      throw new BedrockAuthError(
        "AWS Bedrock authentication failed (401 Unauthorized). Ensure AI_API_KEY is set in production and valid.",
      );
    }

    throw new BedrockRequestError(
      `AWS Bedrock request failed: ${message}`,
      500,
    );
  }
}
