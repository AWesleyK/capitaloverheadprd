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
            We offer garage door repairs for broken springs, cables, roller off track and broken garage door openers. 
            We also stock and carry affordable garage door remotes and keypads for Liftmaster MyQ and Genie garage door openers. 
            Don&apos;t forget! We also repair and install automatic drive way gate operators, servicing brands like Liftmaster, DoorKing, Maximum Controls, 
            US Automatic, and even MightyMule! 
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
