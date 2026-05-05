import React from 'react';
import Head from 'next/head';
import navData from '../../data/nav-data.json';
import ServicesPage from '../../components/ServicesSection/ServicesPage/ServicesPage';

const SITE_URL = "https://dinodoors.net";

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/services#webpage`,
  "url": `${SITE_URL}/services`,
  "name": "Garage Door Services | Dino Doors",
  "description": "Explore Dino Doors' full range of garage door services including repair, installation, spring replacement, opener installation, and more across Oklahoma.",
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${SITE_URL}/services` }
    ]
  }
};

export async function getStaticProps() {
  const services = navData.services;
  return {
    props: {
      initialServices: services,
    },
  };
}

const LearnMore = ({ initialServices }) => {
  return (
    <>
      <Head>
        <title>Garage Door Services | Dino Doors Oklahoma</title>
        <meta name="description" content="Dino Doors offers professional garage door repair, installation, spring replacement, opener service, and more across Oklahoma. Request service today." />
        <link rel="canonical" href={`${SITE_URL}/services`} />
        <meta property="og:title" content="Garage Door Services | Dino Doors Oklahoma" />
        <meta property="og:description" content="Professional garage door repair, installation, spring replacement, opener service, and more across Oklahoma." />
        <meta property="og:url" content={`${SITE_URL}/services`} />
        <meta name="twitter:title" content="Garage Door Services | Dino Doors Oklahoma" />
        <meta name="twitter:description" content="Professional garage door repair, installation, spring replacement, opener service, and more across Oklahoma." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
        />
      </Head>
      <ServicesPage initialServices={initialServices} />
    </>
  );
};

export default LearnMore;
