const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");

// Manually load .env.local because dotenv might not handle multiple lines with same key well
const envContent = fs.readFileSync(".env.local", "utf8");
const lines = envContent.split("\n");
const env = {};
lines.forEach(line => {
    const match = line.match(/^([^=]+)="?([^"]*)"?$/);
    if (match) {
        env[match[1]] = match[2];
    }
});

async function test() {
  const apiKey = env.AI_GATEWAY_API_KEY || env.OPENAI_API_KEY;
  const baseURL = env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";
  const model = env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini";
  
  console.log("Testing with:");
  console.log("apiKey:", apiKey ? "FOUND (ends in " + apiKey.slice(-5) + ")" : "MISSING");
  console.log("baseURL:", baseURL);
  console.log("model:", model);

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (err) {
    console.error("Error Status:", err.status);
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);
  }
}

test();
