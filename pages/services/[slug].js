// /pages/services/[slug].js
import clientPromise from "../../lib/mongodb";
import Head from "next/head";
import Image from "../../components/Shared/SmartImages";
import styles from "../../styles/pageStyles/ServicesSlug.module.scss";
import { FaCheckCircle, FaPhoneAlt, FaTools, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";
import navData from "../../data/nav-data.json";

export async function getStaticPaths() {
  const paths = navData.services.map(service => ({
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
        <title>{service.name} | Dino Doors Garage Doors and More</title>
        <meta name="description" content={service.description} />
      </Head>

      <div className={styles.servicePage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          {service.imageUrl && (
            <div className={styles.heroImageWrapper}>
              <Image
                src={service.imageUrl}
                alt={service.name}
                width={1920}
                height={600}
                className={styles.heroImage}
                priority
              />
            </div>
          )}
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <FaCheckCircle /> Trusted Professional Service
            </div>
            <h1>{service.name}</h1>
          </div>
        </section>

        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <main className={styles.mainContent}>
              <section className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Expert {service.name} in Oklahoma</h2>
                <div className={styles.description}>
                  {service.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <div className={styles.features}>
                <div className={styles.featureItem}>
                  <FaTools />
                  <div>
                    <h3>Quality Workmanship</h3>
                    <p>Our technicians are experts in their craft, ensuring every job is done right.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <FaShieldAlt />
                  <div>
                    <h3>Safe & Reliable</h3>
                    <p>We prioritize your safety and the security of your property above all else.</p>
                  </div>
                </div>
              </div>
            </main>

            <aside className={styles.sidebar}>
              <div className={styles.contactCard}>
                <h3>Need Help Now?</h3>
                <p>Contact us for a free estimate or emergency service.</p>
                <Link href="tel:4054560399" className={styles.phoneButton}>
                  <FaPhoneAlt /> (405) 456-0399
                </Link>
              </div>

              <div className={styles.serviceBenefits}>
                <h4>Why Choose Us?</h4>
                <ul>
                  <li><FaCheckCircle /> Family Owned & Operated</li>
                  <li><FaCheckCircle /> Honest, Upfront Pricing</li>
                  <li><FaCheckCircle /> Same-Day Service Available</li>
                  <li><FaCheckCircle /> Fully Stocked Trucks</li>
                </ul>
              </div>
            </aside>
          </div>

          <div className={styles.bottomCta}>
            <div className={styles.ctaBox}>
              <h2>Ready to upgrade your garage setup?</h2>
              <p>Our team at Dino Doors is here to help. Whether it's a new installation or a quick repair, we've got your back.</p>
              <Link href="tel:4054560399" className={styles.ctaButton}>
                Call Now for a Free Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
