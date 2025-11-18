// /pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});

// small timeout wrapper so we don’t hit Vercel’s hard limit
function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-4.1-mini";

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model,
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
      8000,
      "AI completion"
    );

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      console.error("gptHelper: empty content from AI:", completion);
      return res
        .status(502)
        .json({ error: "AI did not return any content." });
    }

    // Try to parse JSON straight; if it fails, try to salvage
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to salvage JSON if the model sneaks text around it
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const maybeJson = raw.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(maybeJson);
        } catch (e2) {
          console.error("gptHelper: JSON parse error, raw:", raw);
          return res.status(502).json({
            error: "AI returned invalid JSON.",
          });
        }
      } else {
        console.error("gptHelper: JSON parse error, raw:", raw);
        return res.status(502).json({
          error: "AI returned invalid JSON.",
        });
      }
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
      });
    }

    return res.status(200).json({ title, seoTitle, metaDesc, tags, content });
  } catch (err) {
    console.error("gptHelper via AI Gateway error:", err);

    const msg = err?.message || String(err);

    // If OpenAI SDK gives us an HTTP response, surface it
    if (err.status || err.code) {
      return res.status(500).json({
        error: "Failed to generate content.",
        details: `${err.status || err.code} ${msg}`,
      });
    }

    if (msg.includes("timed out")) {
      return res
        .status(504)
        .json({ error: "AI took too long to respond. Please try again." });
    }

    return res
      .status(500)
      .json({ error: "Failed to generate content.", details: msg });
  }
}

