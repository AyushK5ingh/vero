// Quick test script for OpenAI-compatible model API keys
// Usage: set AI_API_KEY (or AWS_API_KEY / GITHUB_TOKEN) and run: node test-token.mjs

const token =
  process.env.AI_API_KEY ||
  process.env.AWS_API_KEY ||
  process.env.GITHUB_TOKEN;
const model =
  process.argv[2] ||
  process.env.AWS_MODEL ||
  process.env.AI_MODEL ||
  process.env.GITHUB_MODEL ||
  "openai/gpt-4.1-mini";
const baseUrl =
  process.env.AWS_MODELS_BASE_URL ||
  process.env.AI_BASE_URL ||
  process.env.GITHUB_MODELS_BASE_URL ||
  "https://models.github.ai/inference";

if (!token) {
  console.error(
    "Missing API key. Set AI_API_KEY (preferred), AWS_API_KEY, or GITHUB_TOKEN.",
  );
  process.exit(1);
}

console.log("Model:", model);
console.log("URL:", `${baseUrl}/chat/completions`);
console.log("---");

const res = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "say hi" }],
    max_tokens: 5,
  }),
});

console.log("Status:", res.status, res.statusText);
const body = await res.text();
console.log("Response:", body.slice(0, 500));

if (res.ok) {
  console.log("\n✅ Token works! Update your .env with this token.");
} else {
  console.log("\n❌ API key rejected. Check your key, model id, and base URL.");
}
