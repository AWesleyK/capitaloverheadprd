// /api/admin/blog/gptHelper.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Create a timeout wrapper (prevents Vercel 504) ---
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("OpenAI request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful writing assistant creating blog content for Dino Doors Garage Doors and More garage door company.  
Your response MUST be valid JSON with fields:
{
  "title": "",
  "seoTitle": "",
  "metaDesc": "",
  "tags": [],
  "content": ""
}
Content must be HTML-safe. Include at least 10 tags.
Make the tone informative and friendly, but reinforce the dangers of working on garage doors and encourage the viewers to call a professional, us. `
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      8000 // 8-second timeout (Vercel limit is ~10s)
    );

    let text = completion.choices?.[0]?.message?.content || "{}";

    // --- Safety check for malformed JSON ---
    try {
      const parsed = JSON.parse(text);

      return res.status(200).json({
        title: parsed.title || "",
        seoTitle: parsed.seoTitle || "",
        metaDesc: parsed.metaDesc || "",
        tags: parsed.tags || [],
        content: parsed.content || "",
      });
    } catch (parseErr) {
      console.error("GPT returned invalid JSON:", text);
      return res.status(500).json({
        error: "Invalid response format from OpenAI",
        raw: text,
      });
    }

  } catch (err) {
    console.error("GPT Helper Error:", err);

    if (err.message.includes("timed out")) {
      return res.status(504).json({
        error: "AI took too long (timed out). Try again.",
      });
    }

    return res.status(500).json({
      error: "Failed to generate content.",
      details: err.message,
    });
  }
}
