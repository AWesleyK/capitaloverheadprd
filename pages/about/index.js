// pages/about.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from '../../components/Shared/SmartImages';
import styles from '../../styles/pageStyles/About.module.scss';

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

  return (
    <>
      <Head>
        <title>About Us | Dino Doors Garage Doors and More</title>
        <meta name="description" content="Learn about Dino Doors Garage Doors and More — a family-owned garage door service company proudly serving rural Oklahoma with integrity and heart." />
      </Head>
      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <h1 className={styles.aboutTitle}>Meet the Family Behind Dino Doors</h1>

          <div className={styles.introImage}>
            <div className={styles.imagePlaceholder}>
              <Image src="/images/family.jpg" alt="Gruszka Family" width={500} height={300} />
            </div>
          </div>

          <p className={styles.aboutText}>
            Allow us to introduce ourselves, Jonathan Gruszka and his family.<br />
            <strong>Owner/Operator</strong> - Jonathan Gruszka<br />
            <strong>Wife</strong> - Francisca Gruszka<br />
            <strong>Our beautiful kids</strong> - Grayson, Geremiah, and Giulianna.
          </p>

          <p className={styles.aboutText}>
            We’re a family owned and operated small company, based in the heart of Oklahoma. Jonathan started this business in 2019 alongside a partner who has since moved on, but the vision remains strong: to offer rural communities an honest, dependable garage door and gate service they can rely on.
          </p>

          <p className={styles.aboutText}>
            The name <strong>Dino Doors</strong> was proudly adopted in late 2024 — inspired by the area's rich history of archaeological discoveries of dinosaur bones throughout this part of Oklahoma.
          </p>

          <p className={styles.aboutText}>
            In early 2025, we expanded our reach even further by opening our first physical location right in the heart of Elmore City at{" "}
            <strong>{addressLine1}</strong>.
          </p>

          <div className={styles.imageGrid}>
            <div className={styles.imagePlaceholder}>
              <Image src="/images/shop.jpg" alt="Elmore City Shop" width={400} height={250} />
            </div>
            <div className={styles.imagePlaceholder}>
              <Image src="/images/jobsite.jpg" alt="Job Site" width={400} height={250} />
            </div>
            <div className={styles.imagePlaceholder}>
              <Image src="/images/sign.jpg" alt="Truck and Logo" width={400} height={250} />
            </div>
          </div>

          <h2 className={styles.aboutSubtitle}>Where We Serve</h2>
          <p className={styles.aboutText}>
            From the back roads to the city edges, we proudly serve:
          </p>

          <ul className={styles.serviceList}>
            <li>Duncan, OK</li>
            <li>Foster, OK</li>
            <li>Norman, OK</li>
            <li>Purcell, OK</li>
            <li>Springer, OK</li>
            <li>Davis, OK</li>
            <li>Katie, OK</li>
            <li>Velma, OK</li>
            <li>Wayne, OK</li>
            <li>Marlow, OK</li>
            <li>Pauls Valley, OK</li>
            <li>Ardmore, OK</li>
            <li>Bradley, OK</li>
            <li>Lindsay, OK</li>
            <li>Maysville, OK</li>
            <li>Stratford, OK</li>
            <li>Wynnewood, OK</li>
            <li>Elmore City, OK</li>
            <li>Ratliff City, OK</li>
          </ul>

          <p className={styles.aboutText}>
            We believe that every home deserves a dependable garage door. No matter how far out you live, we’re here to serve with a smile, and we thank you for trusting our family with your home.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
