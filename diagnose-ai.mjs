import "dotenv/config";

const token =
  process.env.AWS_API_KEY || process.env.AI_API_KEY || process.env.GITHUB_TOKEN;
const endpointFromEnv =
  process.env.AWS_MODELS_BASE_URL ||
  process.env.AI_BASE_URL ||
  process.env.GITHUB_MODELS_BASE_URL;
const endpoints = endpointFromEnv
  ? [endpointFromEnv]
  : [
      "https://models.github.ai/inference",
      "https://models.github.ai/inference/v1",
    ];
const models = [
  process.env.AWS_MODEL,
  process.env.AI_MODEL,
  process.env.GITHUB_MODEL,
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4",
  "openai/gpt-4o",
  "openai/gpt-4.1",
].filter(Boolean);

if (!token) {
  console.error(
    "Missing API key. Set AWS_API_KEY, AI_API_KEY, or GITHUB_TOKEN.",
  );
  process.exit(1);
}

async function diagnose() {
  for (const endpoint of endpoints) {
    for (const model of models) {
      console.log(`Checking ${endpoint} with ${model}...`);
      try {
        const response = await fetch(
          `${endpoint.endsWith("/v1") ? endpoint : endpoint + "/v1"}/chat/completions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: "hi" }],
              model: model,
            }),
          },
        );
        const data = await response.json();
        if (response.ok) {
          console.log(`SUCCESS: ${endpoint} + ${model}`);
          console.log(data.choices[0].message.content);
          return;
        } else {
          console.log(
            `FAIL: ${endpoint} + ${model} - ${data.error?.code}: ${data.error?.message}`,
          );
        }
      } catch (e) {
        console.log(`ERROR: ${endpoint} + ${model} - ${e.message}`);
      }
    }
  }
}

diagnose();
