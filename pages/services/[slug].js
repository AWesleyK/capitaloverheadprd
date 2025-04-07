// /pages/services/[slug].js
import clientPromise from "../../lib/mongodb";
import Head from "next/head";
import Image from "next/image";

export async function getStaticPaths() {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
  
    const services = await db
      .collection("services")
      .find({}, { projection: { slug: 1 } })
      .toArray();
  
    const paths = services
      .filter((s) => !!s.slug) // ✅ Skip entries without a slug
      .map((service) => ({
        params: { slug: service.slug },
      }));
  
    return { paths, fallback: false };
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

      <main style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <h1>{service.name}</h1>
        {service.imageUrl && (
          <Image
            src={service.imageUrl}
            alt={service.name}
            width={800}
            height={500}
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
        )}
        <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>{service.description}</p>
      </main>
    </>
  );
}