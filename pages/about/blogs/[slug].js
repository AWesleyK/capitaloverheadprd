// ./pages/about/blogs/[slug].js

import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../../../styles/pageStyles/Blogs/BlogPost.module.scss";

export async function getServerSideProps({ params }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/content/blogs/get-by-slug?slug=${params.slug}`);
  const blog = await res.json();

  if (!blog || !blog._id) {
    return {
      notFound: true,
    };
  }

  return {
    props: { blog },
  };
}

export default function BlogPostPage({ blog }) {
  const router = useRouter();

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

      {/* Fixed Call Button */}
      <a href="tel:4054560399" className={styles.callButton}>
        Call Now to Learn More
      </a>
    </div>
  );
}
