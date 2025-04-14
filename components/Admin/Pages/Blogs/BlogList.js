// components/Admin/Pages/BlogList.js

import { useEffect, useState } from "react";
import styles from "./BlogList.module.scss";

export default function BlogList({ onEdit }) {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    console.log("Fetching blog posts...");
  
    try {
      const res = await fetch("/api/admin/blog/list");
      const data = await res.json();
  
      console.log("Blog fetch response:", data); // ✅ Log the response
  
      setBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    }
  };
  

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    const res = await fetch(`/api/admin/blog/delete?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchBlogs();
    } else {
      alert("Failed to delete post");
    }
  };

  const togglePublish = async (blog) => {
    try {
      // Get the full blog data from the API
      const resFetch = await fetch(`/api/admin/blog/get?id=${blog._id}`);
      const fullBlog = await resFetch.json();
  
      if (!resFetch.ok) {
        throw new Error(fullBlog.error || "Failed to fetch blog");
      }
  
      const res = await fetch("/api/admin/blog/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fullBlog,
          isPublished: !fullBlog.isPublished,
          id: fullBlog._id, // ensure this is explicitly passed
        }),
      });
  
      if (res.ok) {
        fetchBlogs();
      } else {
        alert("Failed to update publish status");
      }
    } catch (err) {
      console.error("Toggle publish failed:", err);
      alert("Failed to update publish status");
    }
  };
  

  return (
    <div className={styles.blogList}>
      <h2>All Blog Posts</h2>
      {blogs.length === 0 ? (
        <p>No blog posts found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>{blog.title}</td>
                <td>{blog.isPublished ? "Published" : "Draft"}</td>
                <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => onEdit(blog)}>Edit</button>
                  <button onClick={() => togglePublish(blog)}>
                    {blog.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => handleDelete(blog._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
