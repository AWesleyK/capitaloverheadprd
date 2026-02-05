import Head from "next/head";
import Link from "next/link";
import clientPromise from "../../../lib/mongodb";
import styles from "../../../styles/pageStyles/Blogs/BlogIndex.module.scss";

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const blogs = await db
      .collection("blogs")
      .find({ isPublished: true, publishDate: { $lte: new Date() } })
      .sort({ publishDate: -1 })
      .project({
        title: 1,
        slug: 1,
        imageUrl: 1,
        metaDesc: 1,
        publishDate: 1,
      })
      .toArray();

    return {
      props: {
        blogs: JSON.parse(JSON.stringify(blogs)),
      },
    };
  } catch (err) {
    console.error("Failed to fetch visible blogs for SSR:", err);
    return {
      props: {
        blogs: [],
      },
    };
  }
}

export default function BlogIndexPage({ blogs }) {
  return (
    <>
      <Head>
        <title>Dino Doors Blog | Garage Door Tips & News</title>
        <meta name="description" content="Stay updated with the latest garage door tips, maintenance guides, and news from Dino Doors. Your trusted source for garage door expertise in Oklahoma." />
      </Head>
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
    </>
  );
}
