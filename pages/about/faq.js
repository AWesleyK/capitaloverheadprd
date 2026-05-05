import React from 'react';
import Head from 'next/head';
import FAQSection from '../../components/FAQSection/FAQSection';
import navData from '../../data/nav-data.json';
import styles from '../../styles/pageStyles/ServiceAreaCity.module.scss'; // Reusing some styles for consistency

const SITE_URL = "https://dinodoors.net";

export async function getStaticProps() {
  return {
    props: {
      faqs: navData.faqs || [],
    },
    revalidate: 86400, // Revalidate daily
  };
}

const FAQPage = ({ faqs }) => {
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "url": `${SITE_URL}/about/faq`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${SITE_URL}/about/faq` }
      ]
    },
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      <Head>
        <title>Garage Door FAQ | Dino Doors Oklahoma</title>
        <meta name="description" content="Find answers to frequently asked questions about garage door repair, installation, springs, openers, and maintenance from Dino Doors in Oklahoma." />
        <link rel="canonical" href={`${SITE_URL}/about/faq`} />
        <meta property="og:title" content="Garage Door FAQ | Dino Doors Oklahoma" />
        <meta property="og:description" content="Answers to common questions about garage door repair, installation, springs, openers, and maintenance from Dino Doors." />
        <meta property="og:url" content={`${SITE_URL}/about/faq`} />
        <meta name="twitter:title" content="Garage Door FAQ | Dino Doors Oklahoma" />
        <meta name="twitter:description" content="Answers to common questions about garage door repair, installation, springs, openers, and maintenance from Dino Doors." />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </Head>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtext}>
            Find answers to common questions about garage door repair, installation, and maintenance.
          </p>
        </header>

        <main>
          <FAQSection initialFaqs={faqs} />
        </main>

        <style jsx>{`
          .wrapper {
            padding-top: 120px;
          }
        `}</style>
      </div>
    </>
  );
};

export default FAQPage;
