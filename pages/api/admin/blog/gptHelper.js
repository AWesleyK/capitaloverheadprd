import OpenAI from "openai";

// Use Vercel AI Gateway via its OpenAI-compatible API
// Docs: https://vercel.com/docs/ai-gateway/openai-compat
const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});

// Simple timeout guard so we fail before Vercel kills the function
function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        // 👇 model goes through AI Gateway; you configure routing in the Vercel UI
        model: "openai/gpt-4.1",
        response_format: { type: "json_object" }, // force pure JSON from the model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful writing assistant creating blog content for Dino Doors Garage Doors and More, a garage door company. " +
			  "Make the tone informative and friendly, but reinforce the dangers of working on garage doors and encourage the viewers to call a professional, us. " +
              'You MUST respond with a single JSON object with the exact fields: { "title": string, "seoTitle": string, "metaDesc": string, "tags": string[], "content": string }. ' +
              'The "content" field must contain HTML-safe markup (e.g. <p>, <h2>, <ul>, <li>). ' +
              "Include at least 10 relevant tags in the array. Do NOT include any extra fields.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      8000, // 8s so we bail before Vercel’s ~10s limit
      "OpenAI completion"
    );

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      console.error("gptHelper: OpenAI (via Gateway) returned empty content", completion);
      return res.status(502).json({ error: "AI did not return any content." });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("gptHelper: JSON parse error. raw:", raw);
      return res.status(502).json({
        error: "AI returned invalid JSON.",
        raw,
      });
    }

    const {
      title = "",
      seoTitle = "",
      metaDesc = "",
      tags = [],
      content = "",
    } = parsed;

    if (!content) {
      return res.status(502).json({
        error: "AI did not include content field.",
        raw: parsed,
      });
    }

    return res.status(200).json({ title, seoTitle, metaDesc, tags, content });
  } catch (err) {
    console.error("gptHelper via AI Gateway error:", err);
    const msg = err.message || String(err);

    if (msg.includes("timed out")) {
      return res
        .status(504)
        .json({ error: "AI took too long to respond. Please try again." });
    }

    return res.status(500).json({
      error: "Failed to generate content.",
      details: msg,
    });
  }
}
