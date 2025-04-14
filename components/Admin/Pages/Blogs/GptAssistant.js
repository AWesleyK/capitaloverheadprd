// components/Admin/Pages/Blogs/GptAssistant.js
import { useState } from "react";
import styles from "./GptAssistant.module.scss";
import { marked } from "marked";

export default function GptAssistant({ onAutoFill }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blog/gpt-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data && data.content) {
        const html = marked.parse(data.content);

        const autoData = {
          title: data.title || "",
          seoTitle: data.seoTitle || "",
          metaDesc: data.metaDesc || "",
          tags: data.tags || [],
          content: html || "",
        };

        onAutoFill(autoData);
        setPrompt("");
      } else {
        alert("GPT did not return any content.");
      }
    } catch (err) {
      console.error("GPT fetch failed:", err);
      alert("Failed to generate. Try again.");
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
        {loading ? "Generating..." : "Generate with AI"}
      </button>
    </div>
  );
}
