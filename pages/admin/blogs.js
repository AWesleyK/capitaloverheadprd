// pages/admin/blogs.js

import { useState } from "react";
import BlogEditor from "../../components/Admin/Pages/Blogs/BlogEditor";
import BlogList from "../../components/Admin/Pages/Blogs/BlogList"; // You'll create this next
import styles from "./styles/BlogManager.module.scss"; // New stylesheet
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
    requireAuth(ctx, { roles: ["Admin"], minTier: 1 });

export default function BlogManagerPage() {
  const [activeTab, setActiveTab] = useState("editor");
  const [editingPost, setEditingPost] = useState(null);

  const handleEdit = (post) => {
    setEditingPost(post);
    setActiveTab("editor");
  };

  return (
    <div className={styles.blogPage}>
      <div className={styles.tabBar}>
        <button
          className={activeTab === "editor" ? styles.activeTab : ""}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
        <button
          className={activeTab === "list" ? styles.activeTab : ""}
          onClick={() => setActiveTab("list")}
        >
          Our Blogs
        </button>
      </div>

      <div className={styles.tabContent}>
  <div className={`${styles.tabPane} ${activeTab === "editor" ? styles.active : ""}`}>
    <BlogEditor editingPost={editingPost} />
  </div>
  <div className={`${styles.tabPane} ${activeTab === "list" ? styles.active : ""}`}>
    <BlogList key={activeTab} onEdit={handleEdit} />
  </div>
</div>
    </div>
  );
}
