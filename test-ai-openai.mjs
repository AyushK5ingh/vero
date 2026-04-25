import OpenAI from "openai";
import "dotenv/config";

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

async function test() {
  if (!token) {
    console.error(
      "Missing API key. Set AWS_API_KEY, AI_API_KEY, or GITHUB_TOKEN.",
    );
    return;
  }

  console.log("Testing with OpenAI SDK...");
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Hello from GitHub AI!'" }],
      model: model,
    });

    console.log("AI Response:", response.choices[0].message.content);
  } catch (error) {
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Exception:", error.message);
    }
  }
}

test();
