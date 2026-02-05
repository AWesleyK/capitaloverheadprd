// /pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";
import clientPromise from "../../../../lib/mongodb";

const useGateway = !!process.env.AI_GATEWAY_BASE_URL && !!process.env.AI_GATEWAY_API_KEY;

const openai = new OpenAI({
  apiKey: useGateway ? process.env.AI_GATEWAY_API_KEY : process.env.OPENAI_API_KEY,
  ...(useGateway ? { baseURL: process.env.AI_GATEWAY_BASE_URL } : {}),
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

  const model = useGateway
    ? (process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  try {
    console.log("gptHelper: Fetching recent blogs...");
    // Fetch recent blogs for internal linking context
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const recentBlogs = await db
      .collection("blogs")
      .find({ isPublished: true })
      .sort({ publishDate: -1 })
      .limit(5)
      .project({ title: 1, slug: 1, metaDesc: 1 })
      .toArray();

    console.log(`gptHelper: Found ${recentBlogs.length} recent blogs.`);

    let backlinkInstruction = "";
    if (recentBlogs.length > 0) {
      const links = recentBlogs
        .map(
          (b) =>
            `<div class="linkCard"><h5><a href="/about/blogs/${b.slug}">${b.title}</a></h5><p>${b.metaDesc || "Read more about this topic..."}</p></div>`
        )
        .join("\n");
      backlinkInstruction = `\n\nAt the very end of the "content" field, you MUST include a section titled "Check out our other blogs:" using an <h2> or <h3> tag, followed by a div with class "linkGrid" containing these cards:\n<div class="linkGrid">\n${links}\n</div>`;
    }

    console.log("gptHelper: Requesting completion from AI...");
    const completion = await withTimeout(
      openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert content strategist and copywriter for Dino Doors Garage Doors and More, a professional garage door company. " +
              "Your goal is to create high-quality, modern, and visually engaging blog posts. " +
              "Tone: Informative, friendly, and authoritative. Emphasize safety and why professional service is crucial. " +
              'Response format: A single JSON object: { "title": string, "seoTitle": string, "metaDesc": string, "tags": string[], "content": string }. ' +
              'The "content" field MUST use rich HTML for a modern look. Follow these structural rules:\n' +
              '1. Start with a "Key Takeaways" box using: <div class="takeaways"><h4>Key Takeaways</h4><ul><li>...</li></ul></div>\n' +
              '2. Use <h2> for major sections and <h3> for sub-sections to create a clear hierarchy.\n' +
              '3. Use <strong> to highlight important terms and <p> for readable paragraphs.\n' +
              '4. Use <blockquote> for expert tips, safety warnings, or customer advice. You can also use <div class="infoBox"> for helpful side-tips.\n' +
              '5. Use <hr> to separate major thematic shifts.\n' +
              '6. Use <ul> and <li> for lists to break up text.\n' +
              "Include at least 10 SEO-relevant tags in the array. Do NOT include any extra fields." +
              backlinkInstruction,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      25000,
      "AI completion"
    );

    console.log("gptHelper: AI response received.");

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
      .json({ error: "Failed to generate content.", details: msg, stack: err?.stack });
  }
}

