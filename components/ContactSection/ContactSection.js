// ContactSection.js
import React from 'react';
import styles from './ContactSection.module.scss';
import Image from 'next/image';

const ContactSection = () => {
  const phoneNumber = '4054560399'; // Replace with your phone number

  return (
    <section className={styles.contactSection}>
      <div className={styles.content}>
        <div className={styles.taglineContainer}>
          <p className={styles.catchphrase}>
            Experience Top-Notch Garage Door and Gate Solutions!
          </p>
          <a className={styles.callButton} href={`tel:${phoneNumber}`}>
            Consult With Us
          </a>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src="/images/Wood_Gate_Black_Frame.jpg"
            alt="Home Image"
            layout="fill" // This tells Next.js to use the parent dimensions
            objectFit="cover" // This will cover the area without stretching the image
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
