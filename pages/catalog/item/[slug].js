// /pages/catalog/item/[slug].js
import clientPromise from "../../../lib/mongodb";
import Head from "next/head";
import Image from "../../../components/Shared/SmartImages";
import styles from "../../../styles/pageStyles/CatalogItem.module.scss";
import { useRouter } from "next/router";
import { FaArrowLeft, FaPhoneAlt, FaCheckCircle, FaTools, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

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

  const settingsData = await db.collection("catalogsettings").findOne({ key: "catalogSettings" });
  const settings = settingsData ? JSON.parse(JSON.stringify(settingsData)) : navData.catalogSettings;

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
    <>
      <Head>
        <title>{item.name} | {item.brand} | Dino Doors Garage Doors and More</title>
        <meta name="description" content={item.description || `View details for ${item.name} by ${item.brand} at Dino Doors Catalog.`} />
      </Head>

      <div className={styles.itemPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.breadcrumb}>
              <button onClick={handleBack} className={styles.backLink}>
                <FaArrowLeft /> Back to {item.typeName}
              </button>
            </div>
            <h1>{item.name}</h1>
            <p>{item.brand} Quality Products</p>
          </div>
        </section>

        <div className={styles.container}>
          <div className={styles.contentGrid}>
            {/* Left Column: Image and Description */}
            <main className={styles.mainContent}>
              <div className={styles.imageCard}>
                <Image 
                  src={item.imageUrl || '/images/placeholder.png'} 
                  alt={item.name} 
                  width={800} 
                  height={600} 
                  className={styles.productImage} 
                  priority
                />
              </div>

              <section className={styles.detailsSection}>
                <h2>Product Overview</h2>
                <div className={styles.description}>
                  {item.description ? (
                    item.description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <p>No description available for this product.</p>
                  )}
                </div>

                <div className={styles.featuresGrid}>
                  <div className={styles.featureItem}>
                    <FaCheckCircle />
                    <span>Professional Grade</span>
                  </div>
                  <div className={styles.featureItem}>
                    <FaTools />
                    <span>Expert Installation</span>
                  </div>
                  <div className={styles.featureItem}>
                    <FaShieldAlt />
                    <span>Manufacturer Warranty</span>
                  </div>
                </div>
              </section>
            </main>

            {/* Right Column: Sidebar with Price and CTA */}
            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <span className={styles.brandBadge}>{item.brand}</span>
                <h2 className={styles.productTitle}>{item.name}</h2>
                
                <div className={styles.priceSection}>
                  {(() => {
                    const parts = [];
                    if (settings?.showPriceMin && item.priceMin) parts.push(`$${item.priceMin}`);
                    if (settings?.showPriceMax && item.priceMax) parts.push(`$${item.priceMax}`);
                    return parts.length ? (
                      <div className={styles.priceDisplay}>
                        <span className={styles.priceLabel}>Estimated Pricing:</span>
                        <span className={styles.priceValue}>{parts.join(" - ")}</span>
                      </div>
                    ) : (
                      <div className={styles.callForPrice}>
                        <span className={styles.priceLabel}>Pricing:</span>
                        <span className={styles.callValue}>Call for a Free Quote</span>
                      </div>
                    );
                  })()}
                </div>

                <Link href="tel:4054560399" className={styles.ctaButton}>
                  <FaPhoneAlt /> Call (405) 456-0399
                </Link>
                <p className={styles.ctaNote}>Free estimates on all new installations!</p>
              </div>

              <div className={styles.trustBox}>
                <h3>Why Dino Doors?</h3>
                <ul>
                  <li><FaCheckCircle /> Family Owned & Operated</li>
                  <li><FaCheckCircle /> Locally Serving Oklahoma</li>
                  <li><FaCheckCircle /> Honest, Upfront Pricing</li>
                  <li><FaCheckCircle /> 5-Star Rated Service</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
