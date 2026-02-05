// components/Admin/Pages/Blogs/GptAssistant.js
import { useState } from "react";
import styles from "./GptAssistant.module.scss";
import { marked } from "marked";

export default function GptAssistant({ onAutoFill }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [pastedResponse, setPastedResponse] = useState("");
  const [step3Visible, setStep3Visible] = useState(false);

  const handleGetPrompt = () => {
    if (!prompt.trim()) return;
    setStep3Visible(false);
    const constructed = `You are an expert copywriter and SEO strategist for Dino Doors Garage Doors.
Topic: ${prompt}

Goal: Create a high-quality, modern, visually engaging blog post in JSON format.
IMPORTANT: Use valid JSON. In the "content" HTML field, use single quotes for attributes (e.g., <div class='takeaways'>) OR escape double quotes with backslashes (\") to ensure the JSON is valid.
JSON Structure:
{
  "title": "Main title of the blog",
  "seoTitle": "SEO optimized title (under 60 chars)",
  "metaDesc": "Compelling meta description (under 160 chars)",
  "tags": ["tag1", "tag2", ... exactly 10 tags],
  "content": "Rich HTML content here"
}

HTML Content Requirements:
1. Start with <div class="takeaways"><h4>Key Takeaways</h4><ul><li>...</li></ul></div>.
2. Use <h2> and <h3> for clear section hierarchy.
3. Use <strong> for important terms.
4. Use <blockquote> for tips or expert advice.
5. Use <hr> for section breaks.
6. Tone should be informative, friendly, and authoritative.
7. Length should be approximately 500-700 words.
8. DO NOT include any internal links (I will handle those).

Please provide ONLY the JSON object so I can paste it directly into my blog manager.`;
    setGeneratedPrompt(constructed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPastedResponse(event.target?.result || "");
    };
    reader.readAsText(file);
  };

  const handleApplyResponse = async () => {
    if (!pastedResponse.trim()) return;
    setLoading(true);
    setStatus("Processing response...");

    try {
      let raw = pastedResponse.trim();
      
      // Basic salvage: find first { and last }
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.warn("Standard JSON.parse failed, attempting regex salvage...");
        // Try to extract fields manually if JSON is malformed (common with unescaped quotes in AI HTML)
        const title = (raw.match(/"title"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
        const seoTitle = (raw.match(/"seoTitle"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
        const metaDesc = (raw.match(/"metaDesc"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/i) || [])[1];
        const tagsMatch = raw.match(/"tags"\s*:\s*\[([\s\S]*?)\]/i);
        const tags = tagsMatch ? (tagsMatch[1].match(/"([^"]*)"/g) || []).map(t => t.replace(/"/g, "")) : [];

        // Content salvage: assumes it's the last field or at least ends with a quote before the brace
        const contentStartMatch = raw.match(/"content"\s*:\s*"/i);
        if (contentStartMatch) {
          const startIdx = raw.indexOf(contentStartMatch[0]) + contentStartMatch[0].length;
          const endIdx = raw.lastIndexOf('"'); 
          if (endIdx > startIdx) {
            const content = raw.slice(startIdx, endIdx);
            parsed = { title, seoTitle, metaDesc, tags, content };
          }
        }
        
        if (!parsed || !parsed.content) {
          console.error("Salvage failed to find content.");
          throw e; 
        }
      }

      // Fetch recent links (Parallel with local parsing if we wanted, but it's fast)
      const resLinks = await fetch("/api/admin/blog/recentLinks");
      let recentLinksHtml = "";
      if (resLinks.ok) {
        const linksData = await resLinks.json().catch(() => ({}));
        recentLinksHtml = linksData.html || "";
      }

      if (parsed.content) {
        // Use marked in case they sent markdown instead of HTML
        const html = marked.parse(parsed.content) + recentLinksHtml;
        onAutoFill({
          ...parsed,
          content: html,
        });
        setPastedResponse("");
        setGeneratedPrompt("");
        setPrompt("");
        setStep3Visible(false);
        alert("Response applied successfully!");
      } else {
        alert("JSON missing 'content' field.");
      }
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      alert("Invalid JSON. Please ensure you copied the entire object from ChatGPT.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatus("Generating metadata...");

    try {
      // PHASE 1: Metadata
      const resMeta = await fetch("/api/admin/blog/gptHelper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, phase: "meta" }),
      });

      if (!resMeta.ok) {
        const errorData = await resMeta.json().catch(() => ({}));
        throw new Error(errorData.error || `Meta generation failed (${resMeta.status})`);
      }

      const dataMeta = await resMeta.json();
      
      // Pre-fill meta so user sees progress
      onAutoFill({
        title: dataMeta.title || "",
        seoTitle: dataMeta.seoTitle || "",
        metaDesc: dataMeta.metaDesc || "",
        tags: dataMeta.tags || [],
        content: "<p><em>Generating blog content... please wait.</em></p>",
      });

      setStatus("Generating blog content (this may take 10-15s)...");

      // PHASE 2: Content + Recent Links (Parallel)
      const [resContent, resLinks] = await Promise.all([
        fetch("/api/admin/blog/gptHelper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt, 
            phase: "content", 
            title: dataMeta.title 
          }),
        }),
        fetch("/api/admin/blog/recentLinks")
      ]);

      if (!resContent.ok) {
        const errorData = await resContent.json().catch(() => ({}));
        throw new Error(errorData.error || `Content generation failed (${resContent.status})`);
      }

      const dataContent = await resContent.json();
      let recentLinksHtml = "";
      if (resLinks.ok) {
        const linksData = await resLinks.json().catch(() => ({}));
        recentLinksHtml = linksData.html || "";
      }

      if (dataContent && dataContent.content) {
        const html = marked.parse(dataContent.content) + recentLinksHtml;
        onAutoFill({
          ...dataMeta,
          content: html,
        });
        setPrompt("");
        setStatus("");
      } else {
        alert("GPT did not return any content.");
      }
    } catch (err) {
      console.error("GPT fetch failed:", err);
      alert(err.message || "Failed to generate. Try again.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.gptAssistant}>
      <div className={styles.inputSection}>
        <label>Step 1: Describe your blog topic</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Write a blog about common garage door repairs in spring"
          rows={3}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.gptButton} onClick={handleGetPrompt} disabled={loading}>
            Get ChatGPT Prompt
          </button>
          {/* Direct generate hidden for now per user request
          <button className={styles.directButton} onClick={handleGenerate} disabled={loading}>
            {loading ? (status || "Generating...") : "Direct Generate (Beta)"}
          </button>
          */}
        </div>
      </div>

      {generatedPrompt && (
        <div className={styles.promptResult}>
          <label>Step 2: Copy this prompt to ChatGPT</label>
          <textarea readOnly value={generatedPrompt} rows={8} />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(generatedPrompt);
              alert("Prompt copied to clipboard!");
              setStep3Visible(true);
            }}
          >
            Copy Prompt
          </button>
        </div>
      )}

      {step3Visible && (
        <div className={styles.responseSection}>
          <label>Step 3: Paste the ChatGPT response here</label>
          <textarea
            value={pastedResponse}
            onChange={(e) => setPastedResponse(e.target.value)}
            placeholder="Paste the JSON response from ChatGPT here..."
            rows={5}
          />
          <div className={styles.fileUpload}>
            <span>Or upload response file:</span>
            <input type="file" accept=".json,.txt" onChange={handleFileUpload} />
          </div>
          <button 
            className={styles.applyButton} 
            onClick={handleApplyResponse} 
            disabled={loading || !pastedResponse.trim()}
          >
            {loading ? "Processing..." : "Apply AI Response"}
          </button>
        </div>
      )}
    </div>
  );
}
