const OpenAI = require("openai");
require("dotenv").config();

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o";

async function test() {
  console.log("Testing with OpenAI SDK (CJS) pointed at GitHub...");
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: "hi" }
      ],
      model: model
    });

    console.log("AI Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
