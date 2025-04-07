// /pages/catalog/item/[slug].js
import clientPromise from "../../../lib/mongodb";
import styles from "../../../styles/pageStyles/CatalogItem.module.scss";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const client = await clientPromise;
  const db = client.db("garage_catalog");
  const item = await db.collection("catalogItems").findOne({ slug });

  if (!item) {
    return {
      notFound: true,
    };
  }

  item._id = item._id.toString();
  if (item.createdAt) item.createdAt = item.createdAt.toString();
  if (item.modifiedAt) item.modifiedAt = item.modifiedAt.toString();

  return {
    props: { item },
  };
}

export default function CatalogItemPage({ item }) {
  const router = useRouter();

  const handleBack = () => {
    const { search, brand, min, max } = router.query;
    router.push({
      pathname: `/catalog/${item.type.toLowerCase()}`,
      query: { search, brand, min, max },
    });
  };

  return (
    <div>
    <button onClick={handleBack} className={styles.backButton}>← Back to {item.typeName} Catalog</button>
    <div className={styles.catalogItemContainer}>
      <h1 className={styles.title}>{item.name}</h1>
      <p className={styles.brand}>Brand: {item.brand}</p>
      <p className={styles.price}>
        Price: {item.priceMin ? `$${item.priceMin}` : ""}
        {item.priceMin && item.priceMax ? " - " : ""}
        {item.priceMax ? `$${item.priceMax}` : ""}
      </p>
      <div className={styles.imageWrapper}>
        <img src={item.imageUrl} alt={item.name} className={styles.image} />
      </div>
      <p className={styles.description}>{item.description}</p>
    </div>
    </div>
  );
}
