const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference/chat/completions";
const model = "phi-3-mini-4k-instruct";

async function test() {
  console.log("Testing with Fetch directly...");
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hi' }],
        model: model
      })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
