const token =
  process.env.AWS_API_KEY || process.env.AI_API_KEY || process.env.GITHUB_TOKEN;
const baseUrl =
  process.env.AWS_MODELS_BASE_URL ||
  process.env.AI_BASE_URL ||
  process.env.GITHUB_MODELS_BASE_URL ||
  "https://models.github.ai/inference";
const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
const model =
  process.env.AWS_MODEL ||
  process.env.AI_MODEL ||
  process.env.GITHUB_MODEL ||
  "openai/gpt-4.1-mini";

async function test() {
  console.log("Testing with Fetch directly...");
  if (!token) {
    console.error(
      "Missing API key. Set AWS_API_KEY, AI_API_KEY, or GITHUB_TOKEN.",
    );
    return;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hi" }],
        model: model,
      }),
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
