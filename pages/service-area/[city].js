// pages/service-area/[city].js
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/pageStyles/ServiceAreaCity.module.scss';
import { CITY_LIST, normalizeCity } from '../../lib/cities';
import { FaWrench, FaShieldAlt, FaQuestionCircle, FaClock, FaCheckCircle, FaTools } from 'react-icons/fa';
import navData from '../../data/nav-data.json';

// Build a map for quick lookup from slug -> display name
const CITY_MAP = CITY_LIST.reduce((acc, label) => {
  acc[normalizeCity(label)] = label;
  return acc;
}, {});

export async function getStaticPaths() {
  const paths = CITY_LIST.map((label) => ({ params: { city: normalizeCity(label) } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const slug = params.city;
  const label = CITY_MAP[slug];
  if (!label) {
    return { notFound: true };
  }

  // Use pre-generated services for internal linking
  const services = navData.services;

  return {
    props: {
      citySlug: slug,
      cityName: label, // keep original casing like "Elmore City, OK"
      services,
    },
  };
}

export default function CityServiceAreaPage({ cityName, services }) {
  const cityBase = cityName.replace(/,\s*OK$/i, '');
  const title = `Garage Door Services in ${cityBase}, OK | Dino Doors`;
  const description = `Need garage door services in ${cityBase}, OK? Dino Doors provides fast, reliable repair, installation, and maintenance by trusted local technicians. Call today for expert service.`;

  // Layout variation based on city name to provide some visual rotation
  const variant = (cityName.length % 3);
  const variantClass = styles[`variant_${variant}`] || '';

  const faqs = [
    {
      q: `Do you offer emergency garage door repair in ${cityBase}?`,
      a: `Yes! We understand that a broken garage door can be a major security and convenience issue. Dino Doors provides prompt repair services in ${cityBase} to get your door back on track as quickly as possible.`,
    },
    {
      q: `How much does it cost to replace a garage door spring in ${cityBase}?`,
      a: `Spring replacement costs vary depending on the door size and spring type. We provide upfront, honest pricing after a quick inspection. Our ${cityBase} technicians carry high-quality springs for long-lasting performance.`,
    },
    {
      q: `Which garage door brands do you service in ${cityBase}?`,
      a: `We service all major brands, including LiftMaster, Chamberlain, Genie, Wayne Dalton, Clopay, and more. Our team is experienced with a wide range of door models and opener systems.`,
    },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <main className={`${styles.wrapper} ${variantClass}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Garage Door Services in {cityBase}, OK</h1>
          <p className={styles.subtext}>Local, dependable, and done right—the first time.</p>
        </header>

        <section className={styles.section}>
          <p className={styles.paragraph}>
            Dino Doors proudly serves homeowners and businesses throughout <strong>{cityBase}</strong> and the
            surrounding area. Whether you need a quick garage door repair, a full system replacement, or a seasonal
            tune-up, our local team is ready to help with friendly service and honest pricing.
          </p>
          <p className={styles.paragraph}>
            We work on all major brands and door types, and we carry the right parts to finish most jobs in a single
            visit. From noisy openers to broken springs, we’ll get your door working smoothly and safely.
          </p>
          <p className={styles.paragraph}>
            Not sure what you need? Start with a quick phone call—we’ll diagnose the issue and recommend the best next
            step for your home or business in {cityBase}.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Services in {cityBase}</h2>
          <div className={styles.servicesGrid}>
            {Array.isArray(services) &&
              services.map((svc) => (
                <Link className={styles.serviceLink} key={svc.slug} href={`/services/${svc.slug}`}>
                  {svc.name}
                </Link>
              ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3>
                <FaShieldAlt /> Why Dino Doors in {cityBase}
              </h3>
              <ul>
                <li>Local technicians who know {cityBase} and arrive on time</li>
                <li>Upfront, honest pricing—no surprises</li>
                <li>Fully stocked trucks for same-day solutions</li>
                <li>Quality parts and warranties you can count on</li>
                <li>Trusted by your neighbors in {cityBase}</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3>
                <FaWrench /> Common Problems We Fix
              </h3>
              <ul>
                <li>Broken or weak torsion and extension springs</li>
                <li>Off-track doors or misaligned rollers</li>
                <li>Opener failures and sensor alignment</li>
                <li>Noisy operation and worn hardware</li>
                <li>Dented panels and weather seal replacement</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h3>
                  <FaQuestionCircle /> {faq.q}
                </h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.ctaBox}>
          <h2>Ready to Upgrade Your Garage?</h2>
          <p>Contact Dino Doors today for the best garage door services in {cityBase}.</p>
          <Link href="tel:4054560399" className={styles.ctaButton}>
            Call (405) 456-0399
          </Link>
        </div>

        <div className={styles.inlineLinks}>
          <Link href="/">Homepage</Link>
          <Link href="/services/service-area">All Service Areas</Link>
          {Array.isArray(services) &&
            services.slice(0, 3).map((svc) => (
              <Link key={svc.slug} href={`/services/${svc.slug}`}>
                {svc.name}
              </Link>
            ))}
        </div>
      </main>
    </>
  );
}
