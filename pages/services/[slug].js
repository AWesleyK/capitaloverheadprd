// /pages/services/[slug].js
import clientPromise from "../../lib/mongodb";
import Head from "next/head";
import Image from "../../components/Shared/SmartImages";
import styles from "../../styles/pageStyles/ServicesSlug.module.scss";
import { FaCheckCircle, FaPhoneAlt, FaTools, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";
import navData from "../../data/nav-data.json";
import { getCityServicePagesForService, formatCitySlugForUrl } from "../../lib/cityServiceData";
import { FaMapMarkerAlt } from "react-icons/fa";

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

  const cityServicePages = getCityServicePagesForService(params.slug).map(page => ({
    cityName: page.cityName,
    citySlug: formatCitySlugForUrl(page.citySlug),
    serviceSlug: page.serviceSlug
  }));

  return {
    props: {
      service: JSON.parse(JSON.stringify(service)),
      cityServicePages
    }
  };
}

export default function ServicePage({ service, cityServicePages }) {
  const SITE_URL = "https://dinodoors.net";
  const pageUrl = `${SITE_URL}/services/${service.slug}`;
  const metaDesc = service.metaDescription || (service.description || '').split('\n')[0].slice(0, 160);
  const ogImage = service.imageUrl || `${SITE_URL}/transparent-icon.png`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${SITE_URL}/services` },
      { "@type": "ListItem", "position": 3, "name": service.name, "item": pageUrl }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": metaDesc,
    "url": pageUrl,
    "provider": { "@id": `${SITE_URL}/#business` },
    "areaServed": { "@type": "State", "name": "Oklahoma" }
  };

  return (
    <>
      <Head>
        <title>{service.name} | Dino Doors Garage Doors and More</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${service.name} | Dino Doors`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:title" content={`${service.name} | Dino Doors`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
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

          {cityServicePages && cityServicePages.length > 0 && (
            <section className={styles.areasServedSection} style={{ marginTop: '4rem', marginBottom: '4rem' }}>
              <h2 className={styles.sectionTitle}>Areas We Serve for {service.name}</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {cityServicePages.map((page, index) => (
                  <Link 
                    key={index} 
                    href={`/service-area/${page.citySlug}/${page.serviceSlug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#333',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#bf0a30';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.color = '#333';
                    }}
                  >
                    <FaMapMarkerAlt style={{ marginRight: '8px' }} /> {page.cityName}, OK
                  </Link>
                ))}
              </div>
            </section>
          )}

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
