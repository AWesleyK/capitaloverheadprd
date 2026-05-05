import Head from 'next/head';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import styles from '../../../styles/pageStyles/ServiceAreaCity.module.scss';
import { FaWrench, FaShieldAlt, FaQuestionCircle, FaCheckCircle, FaTools, FaMapMarkerAlt, FaChevronRight, FaHome } from 'react-icons/fa';
import { getCityServicePage, getCityServicePaths, getCityHubBySlug, formatCitySlugForUrl, fixInternalPath } from '../../../lib/cityServiceData';

export async function getStaticPaths() {
  const paths = getCityServicePaths();
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { city, service } = params;
  const pageData = getCityServicePage(city, service);

  if (!pageData) {
    return { notFound: true };
  }

  const cityHub = getCityHubBySlug(city);

  return {
    props: {
      pageData,
      cityHub
    },
  };
}

export default function CityServicePage({ pageData, cityHub }) {
  const { hero, content, breadcrumbs, internalLinks } = pageData;

  const title = pageData.metaTitle || pageData.title;
  const description = pageData.metaDescription;
  const canonicalPath = fixInternalPath(pageData.canonicalPath || pageData.urlPath);

  // Layout variation based on city and service name to provide some visual rotation
  const variantIndex = (pageData.cityName.length + pageData.serviceName.length) % 4;
  const variantClass = styles[`variant_${variantIndex}`] || '';

  const Reveal = ({ children, className = "", as: Component = "section" }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <Component
        ref={ref}
        className={`${className} ${styles.animateOnScroll} ${inView ? styles.isVisible : ""}`}
      >
        {children}
      </Component>
    );
  };

  // Local Service Schema
  const localServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": pageData.serviceName,
    "description": description,
    "url": `https://dinodoors.net${canonicalPath}`,
    "provider": { "@id": "https://dinodoors.net/#business" },
    "areaServed": {
      "@type": "City",
      "name": pageData.cityName,
      "addressRegion": "OK",
      "addressCountry": "US"
    }
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.label,
      "item": `https://dinodoors.net${fixInternalPath(b.path)}`
    }))
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://dinodoors.net${canonicalPath}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://dinodoors.net${canonicalPath}`} />
        <meta property="og:image" content="https://dinodoors.net/transparent-icon.png" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localServiceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <main className={`${styles.wrapper} ${variantClass}`}>
        {/* Breadcrumbs */}
        <nav className={`${styles.breadcrumbNav} ${styles.fadeIn}`} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <FaHome style={{ marginRight: '4px' }} /> Home
          </Link>
          <FaChevronRight style={{ fontSize: '0.7rem', opacity: 0.5 }} />
          <Link href="/services/service-area" style={{ color: 'inherit', textDecoration: 'none' }}>
            Service Areas
          </Link>
          <FaChevronRight style={{ fontSize: '0.7rem', opacity: 0.5 }} />
          <Link href={`/service-area/${formatCitySlugForUrl(pageData.citySlug)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {pageData.cityName}, {pageData.state}
          </Link>
          <FaChevronRight style={{ fontSize: '0.7rem', opacity: 0.5 }} />
          <span style={{ fontWeight: 'bold', color: '#333' }}>{pageData.serviceName}</span>
        </nav>

        <header className={`${styles.header} ${styles.fadeIn}`}>
          <h1 className={styles.title}>{hero.title}</h1>
          <p className={styles.subtext}>{hero.subtitle}</p>
        </header>

        <Reveal className={styles.section}>
          {content.intro.map((p, i) => (
            <p key={i} className={styles.paragraph}>{p}</p>
          ))}
        </Reveal>

        {content.localContext && (
          <Reveal className={styles.section}>
            <h2>Local Service in {pageData.cityName}</h2>
            <p className={styles.paragraph}>{content.localContext}</p>
          </Reveal>
        )}

        <Reveal className={styles.section}>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3>
                <FaTools /> Service Highlights
              </h3>
              <ul>
                {content.serviceHighlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className={styles.card}>
              <h3>
                <FaWrench /> Common Issues We Fix
              </h3>
              <ul>
                {content.commonIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <h2>Why Choose Dino Doors?</h2>
          <ul>
            {content.whyChooseDinoDoors.map((reason, i) => (
              <li key={i} className={styles.paragraph} style={{ listStyle: 'none', paddingLeft: '1.5rem', position: 'relative' }}>
                <FaCheckCircle style={{ position: 'absolute', left: 0, top: '0.3rem', color: '#bf0a30' }} /> {reason}
              </li>
            ))}
          </ul>
        </Reveal>

        {content.faq && content.faq.length > 0 && (
          <Reveal className={styles.section}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {content.faq.map((f, i) => (
                <div key={i} className={styles.faqItem}>
                  <h3>
                    <FaQuestionCircle /> {f.question}
                  </h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal as="div" className={styles.ctaBox}>
          <h2>{content.cta.heading}</h2>
          <p>{content.cta.body}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="tel:4054560399" className={styles.ctaButton}>
              {content.cta.secondaryActionLabel || 'Call (405) 456-0399'}
            </Link>
          </div>
        </Reveal>

        <Reveal className={styles.section} style={{ marginTop: '4rem' }}>
          <h2>Related Links</h2>
          <div className={styles.servicesGrid}>
            <Link href={`/service-area/${formatCitySlugForUrl(pageData.citySlug)}`} className={styles.serviceLink}>
              <FaMapMarkerAlt style={{ marginRight: '8px' }} /> {pageData.cityName} Hub
            </Link>
            <Link href={fixInternalPath(internalLinks.parentServicePath)} className={styles.serviceLink}>
              <FaTools style={{ marginRight: '8px' }} /> Main {pageData.serviceName} Page
            </Link>
            {internalLinks.siblingServicePages && internalLinks.siblingServicePages.slice(0, 4).map((link, i) => (
              <Link key={i} href={fixInternalPath(link.path)} className={styles.serviceLink}>
                {link.title}
              </Link>
            ))}
          </div>
        </Reveal>

        {internalLinks.relatedCityServicePages && internalLinks.relatedCityServicePages.length > 0 && (
          <Reveal className={styles.section}>
            <h2>Nearby Cities for {pageData.serviceName}</h2>
            <div className={styles.servicesGrid}>
              {internalLinks.relatedCityServicePages.map((link, i) => (
                <Link key={i} href={fixInternalPath(link.path)} className={styles.serviceLink}>
                  <FaMapMarkerAlt style={{ marginRight: '8px' }} /> {link.title}
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </main>
    </>
  );
}
