// pages/about.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from '../../components/Shared/SmartImages';
import styles from '../../styles/pageStyles/About.module.scss';
import { CITY_LIST, normalizeCity } from '../../lib/cities';
import { FaShieldAlt, FaUserCheck, FaTools, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

const AboutPage = () => {
  const [addressLine1, setAddressLine1] = useState("307 S Main Street"); // fallback

  useEffect(() => {
    fetch("/api/content/site-settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data?.addressLine1) setAddressLine1(data.addressLine1);
      })
      .catch(() => {});
  }, []);

  const coreValues = [
    {
      icon: <FaTools />,
      title: "Expertise",
      description: "With years of experience, our skilled technicians handle everything from simple repairs to complex installations."
    },
    {
      icon: <FaUserCheck />,
      title: "Customer Focus",
      description: "We prioritize our customers' needs and ensure they are satisfied with every job."
    },
    {
      icon: <FaCheckCircle />,
      title: "Quality Assurance",
      description: "We use high-quality parts and stand behind our work with warranties you can count on."
    },
    {
      icon: <FaShieldAlt />,
      title: "Safety Measures",
      description: "Safety is our top priority, both for our technicians and for your family."
    }
  ];

  return (
    <>
      <Head>
        <title>About Us | Dino Doors Garage Doors and More</title>
        <meta name="description" content="Learn about Dino Doors Garage Doors and More — a family-owned garage door service company proudly serving rural Oklahoma with integrity and heart." />
      </Head>

      <div className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>Meet the Family Behind Dino Doors</h1>
            <p>Family Owned. Community Focused. Oklahoma Proud.</p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className={styles.introSection}>
          <div className={styles.container}>
            <div className={styles.introFlex}>
              <div className={styles.introText}>
                <h2 className={styles.sectionTitle}>Rooted in Oklahoma</h2>
                <p className={styles.aboutText}>
                  Allow us to introduce ourselves: Jonathan Gruszka and family. As a family-owned and operated small company based in the heart of Oklahoma, we bring a personal touch to every project.
                </p>
                <div className={styles.familyList}>
                  <p><strong>Owner/Operator:</strong> Jonathan Gruszka</p>
                  <p><strong>Wife:</strong> Francisca Gruszka</p>
                  <p><strong>Our children:</strong> Grayson, Geremiah, and Giulianna</p>
                </div>
                <p className={styles.aboutText}>
                  Jonathan started this business in 2019 with a simple vision: to offer rural communities an honest, dependable garage door and gate service they can rely on.
                </p>
              </div>
              <div className={styles.introImageWrapper}>
                <div className={styles.imageCard}>
                  <Image src="/images/family.jpg" alt="Gruszka Family" width={600} height={450} className={styles.mainImage} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className={styles.valuesSection}>
          <div className={styles.container}>
            <h2 className={`${styles.sectionTitle} ${styles.center}`}>Our Core Values</h2>
            <div className={styles.valuesGrid}>
              {coreValues.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.container}>
            <div className={styles.storyContent}>
              <h2 className={styles.sectionTitle}>The Dino Doors Story</h2>
              <p className={styles.aboutText}>
                The name <strong>Dino Doors</strong> was proudly adopted in late 2024 — inspired by the area's rich history of archaeological discoveries of dinosaur bones throughout this part of Oklahoma. It represents our deep connection to the land and the history of the communities we serve.
              </p>
              <p className={styles.aboutText}>
                In early 2025, we reached a major milestone by opening our first physical location in Elmore City at <strong>{addressLine1}</strong>. This shop allows us to better serve our customers and provides a home base for our growing team.
              </p>
            </div>
            
            <div className={styles.imageGrid}>
              <div className={styles.imagePlaceholder}>
                <Image src="/images/shop.jpg" alt="Elmore City Shop" width={400} height={300} />
              </div>
              <div className={styles.imagePlaceholder}>
                <Image src="/images/jobsite.jpg" alt="Job Site" width={400} height={300} />
              </div>
              <div className={styles.imagePlaceholder}>
                <Image src="/images/sign.jpg" alt="Truck and Logo" width={400} height={300} />
              </div>
            </div>
          </div>
        </section>

        {/* Service Area Section */}
        <section className={styles.serviceAreaSection}>
          <div className={styles.container}>
            <h2 className={`${styles.sectionTitle} ${styles.center}`}>Where We Serve</h2>
            <p className={`${styles.aboutText} ${styles.center}`}>
              From the back roads to the city edges, we proudly serve southern and central Oklahoma.
            </p>

            <div className={styles.cityListWrapper}>
                <ul className={styles.serviceList}>
                {CITY_LIST.map((city, idx) => (
                    <li key={idx}>
                    <Link href={`/service-area/${normalizeCity(city)}`}>
                        <FaMapMarkerAlt /> {city}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

            <div className={styles.ctaBox}>
                <p>We believe that every home deserves a dependable garage door. No matter how far out you live, we’re here to serve with a smile, and we thank you for trusting our family with your home.</p>
                <Link href="tel:4054560399" className={styles.ctaButton}>Call Us Today</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
