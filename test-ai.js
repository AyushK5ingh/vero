const { ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
require("dotenv").config();

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

  console.log("Testing AI endpoint with model:", model);
  console.log("Using endpoint:", endpoint);

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say 'GitHub AI is working!'" },
        ],
        model: model,
      },
    });

    if (isUnexpected(response)) {
      console.error("Unexpected response status:", response.status);
      console.error("Error body:", JSON.stringify(response.body, null, 2));
      return;
    }

    console.log("AI Response:", response.body.choices[0].message.content);
  } catch (error) {
    console.error("Exception during test:", error);
  }
}

testAI();
