// components/Admin/Pages/Blogs/GptAssistant.js
import { useState } from "react";
import styles from "./GptAssistant.module.scss";
import { marked } from "marked";

export default function GptAssistant({ onAutoFill }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

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
      <label>Need help writing? Describe what you want:</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Write a blog about common garage door repairs in spring"
      />
      <button className={styles.gptButton} onClick={handleGenerate} disabled={loading}>
        {loading ? (status || "Generating...") : "Generate with AI"}
      </button>
    </div>
  );
}
