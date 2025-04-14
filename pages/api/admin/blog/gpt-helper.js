import OpenAI from "openai";
import clientPromise from "../../../../lib/mongodb";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
              role: "system",
              content: `You are a helpful writing assistant creating blog content for Dino Doors Garage Doors and More garage door company. Your response must be JSON with the following fields: title, seoTitle, metaDesc, tags (array), and content (HTML-safe string). Make the tone informative and friendly, and encourage users to contact the company when appropriate.`,
            },
            { role: "user", content: prompt },
          ],
        temperature: 0.7,
        max_tokens: 800,
      });
      

    const response = completion.choices[0].message?.content || "{}";
    const parsed = JSON.parse(response);
    const { title, seoTitle, metaDesc, tags, content } = parsed;
    const tokens = completion.usage.total_tokens;

    const estimatedCost = ((tokens / 1000) * 0.0015).toFixed(5);

    const now = new Date();
    const month = `${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;

    const client = await clientPromise;
    const db = client.db();

    await db.collection("gptLogs").updateOne(
      { month },
      {
        $inc: {
          totalBlogs: 1,
          totalCost: parseFloat(estimatedCost),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({ title, seoTitle, metaDesc, tags, content });
  } catch (err) {
    console.error("GPT error:", err);
    return res.status(500).json({ error: "Failed to generate content." });
  }
}
