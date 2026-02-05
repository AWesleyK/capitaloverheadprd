// components/Admin/Pages/BlogEditorToolbar.js

import styles from "./BlogEditorToolbar.module.scss";
import { useState } from "react";

export default function BlogEditorToolbar({ editor }) {
  const [showLinkFields, setShowLinkFields] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const insertLink = () => {
    if (!linkUrl) return alert("Link URL is required");
  
    const hasSelection = editor.state.selection.from !== editor.state.selection.to;
  
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
  
    if (!hasSelection && linkText) {
      editor.chain().focus().insertContent(linkText).run();
    }
  
    setLinkText("");
    setLinkUrl("");
    setShowLinkFields(false);
  };

  const insertTakeaways = () => {
    editor.chain().focus().insertContent(`
      <div class="takeaways">
        <h4>Key Takeaways</h4>
        <ul>
          <li>Point 1</li>
          <li>Point 2</li>
          <li>Point 3</li>
        </ul>
      </div>
      <p></p>
    `).run();
  };

  const insertInfoBox = () => {
    editor.chain().focus().insertContent(`
      <div class="infoBox">
        <p>Enter your helpful tip or additional information here...</p>
      </div>
      <p></p>
    `).run();
  };

  const insertLinkGrid = () => {
    editor.chain().focus().insertContent(`
      <div class="linkGrid">
        <div class="linkCard">
          <h5><a href="#">Related Post Title</a></h5>
          <p>Short description of the related post to engage readers.</p>
        </div>
        <div class="linkCard">
          <h5><a href="#">Another Post Title</a></h5>
          <p>Short description of the related post to engage readers.</p>
        </div>
      </div>
      <p></p>
    `).run();
  };
  

  return (
    <div className={styles.toolbar}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? styles.active : ""}>
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? styles.active : ""}>
        Italic
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? styles.active : ""}>
        H1
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? styles.active : ""}>
        H2
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? styles.active : ""}>
        Bullet List
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? styles.active : ""}>
        Numbered List
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </button>
      <button onClick={() => setShowLinkFields(!showLinkFields)}>
        Add Link
      </button>

      <div style={{ width: "100%", height: "1px", background: "#eee", margin: "0.25rem 0" }} />

      <button onClick={insertTakeaways}>
        + Takeaways Box
      </button>
      <button onClick={insertInfoBox}>
        + Info Tip
      </button>
      <button onClick={insertLinkGrid}>
        + Link Cards
      </button>

      {showLinkFields && (
        <div className={styles.linkPopup}>
          <label>
            Text:
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          </label>
          <label>
            Link:
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </label>
          <button onClick={insertLink}>OK</button>
        </div>
      )}
    </div>
  );
}
