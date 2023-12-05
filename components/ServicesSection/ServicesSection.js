import React from 'react';
import styles from './ServicesSection.module.scss';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Image from 'next/image';
import Link from 'next/link';

const ServicesSection = () => {

  return (
    <section className={styles.servicesSection}>
      <div className={styles.content}>
        <div className={styles.taglineContainer}>
          <h2 className={styles.tagline}>Our Services</h2>
          <p className={styles.catchphrase}>
                We offer a wide range of garage door and automatic gaet operator services and solutions. Whether it's repairs or new installations that you're needing, our team has you covered.
          </p>
          <Link href="/services-page">
  <span className={styles.learnMore}>More Services</span>
</Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
