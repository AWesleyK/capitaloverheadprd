import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/pageStyles/Blogs/BlogIndex.module.scss";

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/content/blogs/list-visible");
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to load public blog list", err);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className={styles.blogIndexPage}>
      <h1 className={styles.heading}>Check Out Some of Our Helpful Blogs!</h1>
      {blogs.length === 0 ? (
        <p className={styles.noPosts}>No published blog posts yet.</p>
      ) : (
        <div className={styles.blogGrid}>
          {blogs.map((post) => (
            <Link href={`/about/blogs/${post.slug}`} key={post._id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={post.imageUrl} alt={post.title} className={styles.image} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.meta}>{new Date(post.publishDate).toLocaleDateString()}</p>
                <p className={styles.desc}>{post.metaDesc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
