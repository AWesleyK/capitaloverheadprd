// components/Admin/Pages/BlogEditor.js

import { useEffect, useState } from "react";
import styles from "./BlogEditor.module.scss";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import GptAssistant from "./GptAssistant";
import BlogEditorToolbar from "./BlogEditorToolbar";

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

export default function BlogEditor({ editingPost }) {
  const [title, setTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [bodyImage, setBodyImage] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        draggable: true,
        HTMLAttributes: {
          class: "blog-image", // 👈 assign class on all rendered images
        },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: styles.editorContent,
        spellCheck: "true",
        style: "cursor: text;",
      },
    },
  });
  

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setSeoTitle(editingPost.seoTitle || "");
      setMetaDesc(editingPost.metaDesc || "");
      setImageUrl(editingPost.imageUrl || "");
      setIsPublished(editingPost.isPublished || false);
      setPublishDate(
        editingPost.publishDate ? new Date(editingPost.publishDate).toISOString().slice(0, 16) : ""
      );
      setTags(editingPost.tags || []);
      if (editor && editingPost.content) {
        editor.commands.setContent(editingPost.content);
      }
    }
  }, [editingPost, editor]);

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

  const handleInsertBodyImage = async () => {
    if (!bodyImage) return alert("Choose an image to insert into the blog body");
    const formData = new FormData();
    formData.append("file", bodyImage);
    formData.append("folder", "blog/body");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    editor?.commands.insertContent(`<img src="${data.url}" alt="" class="blog-image" />`);
    setBodyImage(null);
    alert("Image inserted into blog body!");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const saveBlog = async (publish = false) => {
    if (!title || !editor || !imageUrl) return alert("Missing fields");

    const slug = slugify(title);
    const payload = {
      title,
      seoTitle,
      metaDesc,
      imageUrl,
      isPublished: publish,
      slug,
      tags,
      publishDate: publish ? publishDate || new Date().toISOString() : null,
      content: editor.getHTML(),
    };

    const endpoint = editingPost?._id ? "/api/admin/blog/update" : "/api/admin/blog/publish";
    const method = editingPost?._id ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPost?._id ? { ...payload, id: editingPost._id } : payload),
    });

    if (res.ok) {
      alert(publish ? "Blog post published!" : "Draft saved!");
      setTitle("");
      setSeoTitle("");
      setMetaDesc("");
      setImage(null);
      setImageUrl("");
      setBodyImage(null);
      setIsPublished(false);
      setPublishDate("");
      setTags([]);
      editor.commands.setContent("");
    } else if (res.status === 409) {
      alert("A blog post with this title already exists. Please choose a different title.");
    } else {
      alert("Failed to save blog post.");
    }
  };

  const handleAutoFill = (data) => {
    if (!data) return;
    if (data.title) setTitle(data.title);
    if (data.seoTitle) setSeoTitle(data.seoTitle);
    if (data.metaDesc) setMetaDesc(data.metaDesc);
    if (data.tags) setTags(data.tags);
    if (data.content) editor?.commands.setContent(data.content);
  };

  return (
    <div className={styles.editorPage}>
      <h1>{editingPost ? "Edit Blog Post" : "Create Blog Post"}</h1>

      <div className={styles.formGroup}>
        <label>Post Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>SEO Title:</label>
        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Optional: Appears in search results" />
      </div>

      <div className={styles.formGroup}>
        <label>Meta Description:</label>
        <textarea value={metaDesc} rows={3} onChange={(e) => setMetaDesc(e.target.value)} placeholder="A short summary for search engines" />
      </div>

      <div className={styles.formGroup}>
        <label>Feature Image:</label>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
        <button className={styles.button} onClick={handleUpload}>Upload Image</button>
        {imageUrl && <img src={imageUrl} className={styles.uploadPreview} />}
      </div>

      <div className={styles.formGroup}>
        <label>Tags (press Enter to add):</label>
        <div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} />
          <div>
            {tags.map((tag) => (
              <span key={tag} style={{ marginRight: "0.5rem" }}>{tag} <button onClick={() => handleRemoveTag(tag)}>x</button></span>
            ))}
          </div>
        </div>
      </div>

      {/*<div className={styles.formGroup}>
        <label>Scheduled Publish Date (optional):</label>
        <input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
          </div>*/}

      <div className={styles.formGroup}>
        <label>Blog Body:</label>
        <div className={styles.editorBox}>
          <BlogEditorToolbar editor={editor} />
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Insert Image into Blog Body:</label>
        <input type="file" onChange={(e) => setBodyImage(e.target.files?.[0])} />
        <button className={styles.button} onClick={handleInsertBodyImage}>Upload and Insert</button>
      </div>

      <div className={styles.publishToggle}>
        <input type="checkbox" checked={isPublished} onChange={() => setIsPublished(!isPublished)} />
        <span>Publish Immediately</span>
      </div>

      <div className={styles.seoPreview}>
        <strong>SEO Preview</strong>
        <p>{seoTitle || title}</p>
        <p style={{ color: "#2563eb" }}>https://dinodoors.net/about/blog/{slugify(title)}</p>
        <p>{metaDesc}</p>
      </div>

      <button className={styles.button} onClick={() => saveBlog(true)}>
        Publish Post
      </button>

      <button className={styles.button} style={{ background: "#6b7280" }} onClick={() => saveBlog(false)}>
        Save Draft
      </button>

      <div style={{ marginTop: "2rem" }}>
        <GptAssistant onAutoFill={handleAutoFill} />
      </div>
    </div>
  );
}
