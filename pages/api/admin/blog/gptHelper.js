// pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    console.log("gptHelper: received request at", new Date().toISOString());

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful writing assistant creating blog content for Dino Doors Garage Doors and More garage door company. " +
            "Your response must be JSON with the following fields: title, seoTitle, metaDesc, tags (array), and content (HTML-safe string). " +
            "Make the tone informative and friendly, but reinforce the dangers of working on garage doors and encourage the viewers to call a professional, us. " +
            "Include at least 10 tags in the array.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log("gptHelper: got response from OpenAI");

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("gptHelper: JSON parse error, raw content:", raw);
      return res.status(502).json({
        error: "AI returned invalid JSON",
        raw,
      });
    }

    const { title, seoTitle, metaDesc, tags, content } = parsed;

    return res.status(200).json({ title, seoTitle, metaDesc, tags, content });
  } catch (err) {
    console.error("gptHelper error:", err);
    return res.status(500).json({
      error: "Failed to generate content.",
      details: err.message || String(err),
    });
  }
}
