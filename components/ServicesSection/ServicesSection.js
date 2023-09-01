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
                We offer a wide range of services. You can come to us for anything ranging from garage door and garage door opener repairs 
                all the way to custom welded gates. Click below for more detail!
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
