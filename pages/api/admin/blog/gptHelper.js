// /pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";
import clientPromise from "../../../../lib/mongodb";

const useGateway = !!process.env.AI_GATEWAY_BASE_URL && !!process.env.AI_GATEWAY_API_KEY;

const openai = new OpenAI({
  apiKey: useGateway ? process.env.AI_GATEWAY_API_KEY : process.env.OPENAI_API_KEY,
  ...(useGateway ? { baseURL: process.env.AI_GATEWAY_BASE_URL } : {}),
});

export const config = {
  api: {
    responseLimit: false,
  },
  maxDuration: 60, // Increase timeout for long-running AI generations (Pro/Enterprise)
};

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
  const overallStart = Date.now();
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
    const dbStartTime = Date.now();
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

    const dbDuration = Date.now() - dbStartTime;
    console.log(`gptHelper: Found ${recentBlogs.length} recent blogs in ${dbDuration}ms.`);

    let backlinkHtml = "";
    if (recentBlogs.length > 0) {
      const links = recentBlogs
        .map(
          (b) =>
            `<div class="linkCard"><h5><a href="/about/blogs/${b.slug}">${b.title}</a></h5><p>${b.metaDesc || "Read more about this topic..."}</p></div>`
        )
        .join("\n");
      backlinkHtml = `\n\n<h3>Check out our other blogs:</h3>\n<div class="linkGrid">\n${links}\n</div>`;
    }

    console.log("gptHelper: Requesting completion from AI...");
    const aiStartTime = Date.now();
    const completion = await withTimeout(
      openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert copywriter for Dino Doors Garage Doors. " +
              "Goal: Create a high-quality, modern, visually engaging blog post. " +
              "Tone: Informative, friendly, authoritative. " +
              'Response: JSON { "title", "seoTitle", "metaDesc", "tags": [], "content" }. ' +
              'The "content" field MUST use rich HTML:\n' +
              '1. <div class="takeaways"><h4>Key Takeaways</h4><ul><li>...</li></ul></div> at start.\n' +
              '2. <h2> and <h3> for hierarchy.\n' +
              '3. <strong> for terms, <p> for paragraphs, <blockquote> for tips, <hr> for breaks.\n' +
              "Include exactly 10 SEO tags. Do NOT add internal links or a 'other blogs' section; I will handle that."
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000, // Reduced for faster response within Vercel limits
      }),
      50000,
      "AI completion"
    );

    const aiDuration = ((Date.now() - aiStartTime) / 1000).toFixed(2);
    console.log(`gptHelper: AI response received in ${aiDuration}s.`);

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

    // Append backlinks manually
    const finalContent = content.trim() + backlinkHtml;

    const totalDuration = Date.now() - overallStart;
    console.log(`gptHelper: Success! Total execution time: ${totalDuration}ms.`);

    return res.status(200).json({ title, seoTitle, metaDesc, tags, content: finalContent });
  } catch (err) {
    const totalDuration = Date.now() - overallStart;
    console.error(`gptHelper: Error after ${totalDuration}ms:`, err);

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

