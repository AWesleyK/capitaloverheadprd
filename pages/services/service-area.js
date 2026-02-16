// pages/services/service-area.js
import React from 'react';
import Head from 'next/head';
import ServiceArea from '../../components/ServicesSection/ServicesPage/ServiceArea/ServiceArea';
import { CITY_LIST } from '../../lib/cities';
import styles from '../../styles/pageStyles/ServiceAreaPage.module.scss';
import { FaClock, FaTools, FaCheckCircle, FaPhoneAlt } from 'react-icons/fa';

const ServiceAreaPage = () => {
  const introCopy =
    "Find trusted, local garage door service across Southern and Central Oklahoma. From repairs and tune-ups to new installations, our team comes to you—fast, friendly, and done right.";

  return (
    <>
      <Head>
        <title>Service Areas We Serve in Oklahoma | Dino Doors</title>
        <meta
          name="description"
          content="Browse our Oklahoma service areas. Dino Doors provides reliable garage door repair, installation, and maintenance across local cities including Elmore City, Duncan, Ardmore, and more."
        />
      </Head>
      
      <div className={styles.serviceAreaPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>Where We Serve</h1>
            <p>Reliable Garage Door Solutions Across the Heart of Oklahoma</p>
          </div>
        </section>

        <main className={styles.mainContent}>
          <section className={styles.introSection}>
            <div className={styles.container}>
              <h2 className={styles.introTitle}>Local Service You Can Count On</h2>
              <p className={styles.introText}>
                {introCopy}
              </p>
            </div>
          </section>

          <section className={styles.benefitsSection}>
            <div className={styles.container}>
              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                    <div className={styles.benefitIconWrapper}>
                        <FaClock className={styles.benefitIcon} />
                    </div>
                    <h3>Same-Day Service</h3>
                    <p>We understand that a broken garage door is more than just an inconvenience—it's a security risk. That's why we prioritize prompt, often same-day service.</p>
                </div>
                <div className={styles.benefitCard}>
                    <div className={styles.benefitIconWrapper}>
                        <FaTools className={styles.benefitIcon} />
                    </div>
                    <h3>Expert Repairs</h3>
                    <p>From broken springs and cables to malfunctioning openers, our technicians have the expertise to fix any garage door issue right the first time.</p>
                </div>
                <div className={styles.benefitCard}>
                    <div className={styles.benefitIconWrapper}>
                        <FaCheckCircle className={styles.benefitIcon} />
                    </div>
                    <h3>Quality Parts</h3>
                    <p>We only use high-quality, durable parts from trusted manufacturers to ensure your garage door operates smoothly and safely for years to come.</p>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.container}>
            <div className={styles.divider}></div>
            <h2 className={styles.sectionHeading}>Our Coverage Map</h2>
            <ServiceArea cities={CITY_LIST} intro="" hideHeading={true} />
          </div>
        </main>
      </div>
    </>
  );
};

export default ServiceAreaPage;
