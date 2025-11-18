// pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";
import clientPromise from "../../../../lib/mongodb";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function withTimeout(promise, ms, label) {
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
    console.log("gptHelper: received request", {
      host: req.headers.host,
      time: new Date().toISOString(),
    });

    // ---- 1) Call OpenAI, with a timeout guard ----
    const completion = await withTimeout(
      openai.chat.completions.create({
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
      }),
      15000,
      "OpenAI completion"
    );

    console.log("gptHelper: got response from OpenAI");

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("gptHelper: JSON parse error. Raw content:", raw);
      return res.status(502).json({
        error: "AI returned invalid JSON.",
        raw,
      });
    }

    const { title, seoTitle, metaDesc, tags, content } = parsed;
    const tokens = completion.usage?.total_tokens || 0;

    // ---- 2) Fire-and-forget logging with its own timeout ----
    (async () => {
      try {
        const estimatedCost = tokens
          ? ((tokens / 1000) * 0.0015).toFixed(5)
          : "0.00000";

        const now = new Date();
        const month = `${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;

        const client = await withTimeout(
          clientPromise,
          5000,
          "Mongo client connection"
        );
        const db = client.db();

        await withTimeout(
          db.collection("gptLogs").updateOne(
            { month },
            {
              $inc: {
                totalBlogs: 1,
                totalCost: parseFloat(estimatedCost),
              },
            },
            { upsert: true }
          ),
          5000,
          "Mongo updateOne"
        );

        console.log("gptHelper: logging completed");
      } catch (logErr) {
        console.error("gptHelper: logging failed (non-fatal):", logErr.message);
      }
    })();

    // ---- 3) Return the result to the client ASAP ----
    return res.status(200).json({ title, seoTitle, metaDesc, tags, content });
  } catch (err) {
    console.error("gptHelper error:", err);
    return res.status(500).json({
      error: "Failed to generate content.",
      details: err.message || String(err),
    });
  }
}
