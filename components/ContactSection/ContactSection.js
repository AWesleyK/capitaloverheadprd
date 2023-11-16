import React from 'react';
import styles from './ContactSection.module.scss';
import Image from 'next/image';
import contactImage from 'public/images/Wood_Gate_Black_Frame.jpg'

const ContactSection = () => {
  const phoneNumber = '4054560399'; // Replace with your phone number

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const imageWidth = isMobile ? 200 : 300; // Adjust image width for mobile
  const imageHeight = isMobile ? 200 : 300; // Adjust image height for mobile

  return (
    <section className={styles.contactSection}>
      <div className={styles.content}>
        <div className={styles.taglineContainer}>
          <p className={styles.catchphrase}>
            Experience Top-Notch Garage Door and Gate Solutions!
          </p>
          <a className={styles.callButton} href="tel:4054560399">
            Consult With Us
          </a>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src="/images/Wood_Gate_Black_Frame.jpg"
            alt="Home Image"
            width={imageWidth}
            height={imageHeight}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
