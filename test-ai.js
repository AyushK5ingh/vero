const { ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
require('dotenv').config();

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o"; // Using a known good model

async function testAI() {
  if (!token) {
    console.error("GITHUB_TOKEN not found in environment");
    return;
  }

  console.log("Testing GitHub AI with model:", model);
  console.log("Using endpoint:", endpoint);

  try {
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say 'GitHub AI is working!'" }
        ],
        model: model
      }
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
