import OpenAI from "openai";
import "dotenv/config";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o";

async function test() {
  console.log("Testing with OpenAI SDK pointed at GitHub...");
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: "Say 'Hello from GitHub AI!'" }
      ],
      model: model
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
