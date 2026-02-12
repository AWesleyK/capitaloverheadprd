// /pages/catalog/item/[slug].js
import clientPromise from "../../../lib/mongodb";
import styles from "../../../styles/pageStyles/CatalogItem.module.scss";
import { useRouter } from "next/router";

import navData from "../../../data/nav-data.json";

export async function getStaticPaths() {
  const paths = navData.catalogItems.map(item => ({
    params: { slug: item.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const client = await clientPromise;
  const db = client.db("garage_catalog");
  const item = await db.collection("catalogItems").findOne({ slug });

  if (!item) {
    return {
      notFound: true,
    };
  }

  const settings = navData.catalogSettings;

  item._id = item._id.toString();
  if (item.createdAt) item.createdAt = item.createdAt.toString();
  if (item.modifiedAt) item.modifiedAt = item.modifiedAt.toString();

  return {
    props: { item, settings },
  };
}

export default function CatalogItemPage({ item, settings }) {
  const router = useRouter();

  const handleBack = () => {
    const { search, brand, min, max } = router.query;
    router.push({
      pathname: `/catalog/${item.type.toLowerCase()}`,
      query: {
        search,
        brand,
        ...(settings?.showPriceMin ? { min } : {}),
        ...(settings?.showPriceMax ? { max } : {}),
      },
    });
  };

  return (
    <div>
    <button onClick={handleBack} className={styles.backButton}>← Back to {item.typeName} Catalog</button>
    <div className={styles.catalogItemContainer}>
      <h1 className={styles.title}>{item.name}</h1>
      <p className={styles.brand}>Brand: {item.brand}</p>
      {(() => {
        const parts = [];
        if (settings?.showPriceMin && item.priceMin) parts.push(`$${item.priceMin}`);
        if (settings?.showPriceMax && item.priceMax) parts.push(`$${item.priceMax}`);
        return parts.length ? (
          <p className={styles.price}>Price: {parts.join(" - ")}</p>
        ) : null;
      })()}
      <div className={styles.imageWrapper}>
        <img src={item.imageUrl} alt={item.name} className={styles.image} />
      </div>
      <p className={styles.description}>{item.description}</p>
    </div>
    </div>
  );
}
