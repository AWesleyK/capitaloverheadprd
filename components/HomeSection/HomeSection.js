import React from 'react';
import styles from './HomeSection.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const HomeSection = () => {
  return (
    <section className={styles.homeSection}>
      <div className={styles.container}>
        <div className={styles.text}>
          <h1 className={styles.title}>Schedule a visit now!</h1>
          <div className={styles.subtitle}>
            <p>
              Hold the stress, let us check your garage door:
            </p>
            <p>
              <Link className={styles.phoneNumber} href="tel:4054560399">(405) 456-0399</Link>
            </p>
          </div>
          {/*<div className={styles.buttonContainer}>
            <Link href="/scheduler">
              <span className={styles.scheduleButton}>Services</span>
            </Link>
  </div>*/}
        </div>
        <div className={styles.imageContainer}>
          <Image
            src="/images/Homepage8.jpeg"
            alt="Home Image"
            width={300}
            height={300}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
