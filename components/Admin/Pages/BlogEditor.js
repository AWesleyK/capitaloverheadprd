// components/Admin/Pages/BlogEditor.js

import { useState } from "react";
import styles from "./BlogEditor.module.scss";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "<p>Start writing your blog post...</p>",
  });

  const handleUpload = async () => {
    if (!image) return alert("Select an image");
    const formData = new FormData();
    formData.append("file", image);
    formData.append("folder", "blog");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setImageUrl(data.url);
  };

  const handlePublish = async () => {
    if (!title || !editor || !imageUrl) return alert("Missing fields");

    const payload = {
      title,
      seoTitle,
      metaDesc,
      imageUrl,
      isPublished,
      content: editor.getHTML(),
    };

    const res = await fetch("/api/blog/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Blog post published!");
      setTitle("");
      setSeoTitle("");
      setMetaDesc("");
      setImage(null);
      setImageUrl("");
      editor.commands.setContent("<p>Start writing your blog post...</p>");
    } else {
      alert("Failed to publish.");
    }
  };

  return (
    <div className={styles.page}>
      <h1>Create Blog Post</h1>

      <div className={styles.formGroup}>
        <label>Post Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>SEO Title:</label>
        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Optional: Appears in search results"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Meta Description:</label>
        <textarea
          value={metaDesc}
          rows={3}
          onChange={(e) => setMetaDesc(e.target.value)}
          placeholder="A short summary for search engines"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Feature Image:</label>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
        <button className={styles.button} onClick={handleUpload}>
          Upload Image
        </button>
        {imageUrl && <img src={imageUrl} className={styles.imagePreview} />}
      </div>

      <div className={styles.editorBox}>
        <EditorContent editor={editor} />
      </div>

      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={() => setIsPublished(!isPublished)}
          />
          &nbsp; Publish Immediately
        </label>
      </div>

      <button className={styles.button} onClick={handlePublish}>
        Publish Post
      </button>
    </div>
  );
}