import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o-mini";


async function testAI() {
  if (!token) {
    console.error("GITHUB_TOKEN not found in environment");
    return;
  }

  console.log("Testing GitHub AI (Minimal ESM) with model:", model);

  try {
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "user", content: "Say 'Hello'" }
        ],
        model: model
      }
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
