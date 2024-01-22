import React from 'react';
import styles from './AboutSection.module.scss';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Image from 'next/image';
import Link from 'next/link';

const AboutSection = () => {
  const images = [
  ];

  return (
    <section className={styles.aboutSection}>
      <div className={styles.content}>
        <div className={styles.taglineContainer}>
          <h2 className={styles.tagline}>About Us</h2>
          <p className={styles.catchphrase}>
          At Capital Overhead we take pride in being your local garage door and automatic gate repair and installation provider. 
          Our team is trained and ready to work on your garage door openers like Liftmaster MyQ, Genie, Linear, and many others! 
          With our packages, we can save you costs and time by performing our garage door inspections and offering proactive 
          plans to prevent your garage door from failing, while also saving money! Whether your garage door won&apos;t open because of a broken spring, 
          or your garage door opener stopped working and needs service. We have you covered with affordable and upfront pricing! 
          Serving the Garvin County and surrounding areas with a smile! 
          </p>
          <Link href="/learn-more">
  <span className={styles.learnMore}>Learn More</span>
</Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
