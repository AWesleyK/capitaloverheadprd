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
      props: { 
        blog: JSON.parse(JSON.stringify(blog)),
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://dinodoors.net"
      },
    };
  } catch (err) {
    console.error("Failed to SSR blog post:", err);
    return { notFound: true };
  }
}

export default function BlogPostPage({ blog, baseUrl }) {
  const fullUrl = `${baseUrl}/about/blogs/${blog.slug}`;
  const publishDate = new Date(blog.publishDate).toISOString();
  const modifiedDate = new Date(blog.updatedAt || blog.publishDate).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.seoTitle || blog.title,
    "image": [blog.imageUrl],
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "author": [{
      "@type": "Organization",
      "name": "Dino Doors Garage Doors and More",
      "url": baseUrl
    }],
    "description": blog.metaDesc,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  };

  return (
    <div className={styles.blogPostPage}>
      <Head>
        <title>{blog.seoTitle || blog.title}</title>
        <meta name="description" content={blog.metaDesc} />
        <link rel="canonical" href={fullUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={blog.seoTitle || blog.title} />
        <meta property="og:description" content={blog.metaDesc} />
        <meta property="og:image" content={blog.imageUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:section" content="Garage Door Services" />
        {blog.tags && blog.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.seoTitle || blog.title} />
        <meta name="twitter:description" content={blog.metaDesc} />
        <meta name="twitter:image" content={blog.imageUrl} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <article className={styles.article}>
        <h1 className={styles.title}>{blog.title}</h1>
        <div className={styles.metaInfo}>
          <p className={styles.date}>{new Date(blog.publishDate).toLocaleDateString()}</p>
          {blog.tags && blog.tags.length > 0 && (
            <div className={styles.tags}>
              {blog.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
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
