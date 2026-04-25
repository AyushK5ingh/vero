import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token =
  process.env.AWS_API_KEY || process.env.AI_API_KEY || process.env.GITHUB_TOKEN;
const endpoint =
  process.env.AWS_MODELS_BASE_URL ||
  process.env.AI_BASE_URL ||
  process.env.GITHUB_MODELS_BASE_URL ||
  "https://models.github.ai/inference";
const model =
  process.env.AWS_MODEL ||
  process.env.AI_MODEL ||
  process.env.GITHUB_MODEL ||
  "openai/gpt-4.1-mini";

async function testAI() {
  if (!token) {
    console.error(
      "Missing API key. Set AWS_API_KEY, AI_API_KEY, or GITHUB_TOKEN.",
    );
    return;
  }

  console.log("Testing AI endpoint (Minimal ESM) with model:", model);

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [{ role: "user", content: "Say 'Hello'" }],
        model: model,
      },
    });

    if (isUnexpected(response)) {
      console.error("Error body:", response.body);
      return;
    }

    console.log("AI Response:", response.body.choices[0].message.content);
  } catch (error) {
    console.error("Exception:", error);
  }
}

testAI();
