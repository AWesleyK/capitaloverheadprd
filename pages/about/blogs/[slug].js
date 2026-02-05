// ./pages/about/blogs/[slug].js

import Head from "next/head";
import clientPromise from "../../../lib/mongodb";
import styles from "../../../styles/pageStyles/Blogs/BlogPost.module.scss";

export async function getServerSideProps({ params }) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const blog = await db
      .collection("blogs")
      .findOne({ slug: params.slug, isPublished: true });

    if (!blog) {
      return { notFound: true };
    }

    return {
      props: { blog: JSON.parse(JSON.stringify(blog)) },
    };
  } catch (err) {
    console.error("Failed to SSR blog post:", err);
    return { notFound: true };
  }
}

export default function BlogPostPage({ blog }) {
  return (
    <div className={styles.blogPostPage}>
      <Head>
        <title>{blog.seoTitle || blog.title}</title>
        <meta name="description" content={blog.metaDesc} />
      </Head>

      <article className={styles.article}>
        <h1 className={styles.title}>{blog.title}</h1>
        <p className={styles.date}>{new Date(blog.publishDate).toLocaleDateString()}</p>
        <img src={blog.imageUrl} alt={blog.title} className={styles.heroImage} />
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      <a href="tel:4054560399" className={styles.callButton}>
        Call Now to Learn More
      </a>
    </div>
  );
}
