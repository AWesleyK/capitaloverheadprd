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
          At Capital Overhead Doors and Gates, we take pride in being your trusted partner for top-notch garage door and gate solutions in Oklahoma. 
          With a passion for excellence and a commitment to customer satisfaction, 
          we specialize in providing reliable installation, repair, and maintenance services for both residential and commercial properties. 
          Our skilled technicians bring years of experience to every project, ensuring your doors and gates function flawlessly and enhance the safety and security of your space. 
          Whether you need a new installation, quick repair, or routine maintenance, count on us to deliver exceptional service that meets your needs and exceeds your expectations. 
          Contact us today to experience the difference of quality craftsmanship and unparalleled customer care.
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
