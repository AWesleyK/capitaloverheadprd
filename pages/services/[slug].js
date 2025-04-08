// /pages/services/[slug].js
import clientPromise from "../../lib/mongodb";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/pageStyles/ServicesSlug.module.scss";

export async function getStaticPaths() {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const services = await db.collection("services").find({}, { projection: { slug: 1 } }).toArray();

    const paths = services.map(service => ({
      params: { slug: service.slug },
    }));

    return { paths, fallback: false };
  } catch (error) {
    console.error("MongoDB connection failed in getStaticPaths:", error);
    return { paths: [], fallback: false };
  }
}

export async function getStaticProps({ params }) {
  const client = await clientPromise;
  const db = client.db("garage_catalog");
  const service = await db.collection("services").findOne({ slug: params.slug });

  return {
    props: {
      service: JSON.parse(JSON.stringify(service))
    }
  };
}

export default function ServicePage({ service }) {
  return (
    <>
      <Head>
        <title>{service.name} | Dino Doors</title>
        <meta name="description" content={service.description} />
      </Head>

      <main className={styles.wrapper}>
        <h1 className={styles.title}>{service.name}</h1>
        {service.imageUrl && (
          <Image
            src={service.imageUrl}
            alt={service.name}
            width={800}
            height={500}
            className={styles.image}
          />
        )}
        <p className={styles.description}>{service.description}</p>
      </main>
    </>
  );
}
