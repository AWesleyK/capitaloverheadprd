// /pages/api/admin/blog/gptHelper.js
import OpenAI from "openai";
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

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

async function handler(req, res) {
  const overallStart = Date.now();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, phase = "all", title: passedTitle } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const model = useGateway
    ? (process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  try {
    let systemPrompt = "";
    if (phase === "meta") {
      systemPrompt = 
        "You are an expert SEO copywriter for Dino Doors. " +
        "Goal: Generate blog metadata based on the topic. " +
        'Response: JSON { "title", "seoTitle", "metaDesc", "tags": [] }. ' +
        "IMPORTANT: Use valid JSON. Include exactly 10 SEO tags.";
    } else if (phase === "content") {
      systemPrompt = 
        `You are an expert copywriter for Dino Doors. Write content for a blog post titled: "${passedTitle}". ` +
        "Goal: Create high-quality, modern, visually engaging HTML content. " +
        "Tone: Informative, friendly, authoritative. " +
        'Response: JSON { "content" }. ' +
        'IMPORTANT: Use valid JSON. In the "content" HTML field, use single quotes for attributes OR escape double quotes with backslashes.\n' +
        'The "content" field MUST use rich HTML:\n' +
        '1. <div class="takeaways"><h4>Key Takeaways</h4><ul><li>...</li></ul></div> at start.\n' +
        '2. <h2> and <h3> for hierarchy.\n' +
        '3. <strong> for terms, <p> for paragraphs, <blockquote> for tips, <hr> for breaks.\n' +
        "Do NOT add internal links. Be concise (approx 500 words).";
    } else {
      systemPrompt = 
        "You are an expert copywriter for Dino Doors Garage Doors. " +
        "Goal: Create a high-quality, modern, visually engaging blog post. " +
        "Tone: Informative, friendly, authoritative. " +
        'Response: JSON { "title", "seoTitle", "metaDesc", "tags": [], "content" }. ' +
        'IMPORTANT: Use valid JSON. In the "content" HTML field, use single quotes for attributes OR escape double quotes with backslashes.\n' +
        'The "content" field MUST use rich HTML:\n' +
        '1. <div class="takeaways"><h4>Key Takeaways</h4><ul><li>...</li></ul></div> at start.\n' +
        '2. <h2> and <h3> for hierarchy.\n' +
        '3. <strong> for terms, <p> for paragraphs, <blockquote> for tips, <hr> for breaks.\n' +
        "Include exactly 10 SEO tags. Do NOT add internal links.";
    }

    const aiStartTime = Date.now();
    const completion = await withTimeout(
      openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: phase === "meta" ? 300 : 700,
      }),
      9000, // 9 seconds limit for Vercel Hobby
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
          // Final attempt: regex extraction for malformed JSON (unescaped quotes in HTML)
          console.warn("gptHelper: Standard parse failed, trying regex salvage...");
          const title = (maybeJson.match(/"title"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
          const seoTitle = (maybeJson.match(/"seoTitle"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
          const metaDesc = (maybeJson.match(/"metaDesc"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
          const tagsMatch = maybeJson.match(/"tags"\s*:\s*\[([\s\S]*?)\]/i);
          const tags = tagsMatch ? (tagsMatch[1].match(/"([^"]*)"/g) || []).map(t => t.replace(/"/g, "")) : [];
          const contentStartMatch = maybeJson.match(/"content"\s*:\s*"/i);
          let content = null;
          if (contentStartMatch) {
            const startIdx = maybeJson.indexOf(contentStartMatch[0]) + contentStartMatch[0].length;
            const endIdx = maybeJson.lastIndexOf('"');
            if (endIdx > startIdx) {
              content = maybeJson.slice(startIdx, endIdx);
            }
          }

          if (content || title) {
            parsed = { title, seoTitle, metaDesc, tags, content };
          } else {
            console.error("gptHelper: JSON parse error, raw:", raw);
            return res.status(502).json({
              error: "AI returned invalid JSON.",
            });
          }
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

    // Validation: Require content only if we are in a phase that generates it
    if ((phase === "all" || phase === "content") && !content) {
      return res.status(502).json({
        error: "AI did not include content field.",
      });
    }

    // Validation: Require basic metadata if we are in a phase that generates it
    if ((phase === "all" || phase === "meta") && !title && !parsed.title) {
      return res.status(502).json({
        error: "AI did not include title field.",
      });
    }

    const totalDuration = Date.now() - overallStart;
    console.log(`gptHelper: Success! Total execution time: ${totalDuration}ms.`);

    return res.status(200).json({ 
      title, 
      seoTitle, 
      metaDesc, 
      tags, 
      content: content 
    });
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

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });

