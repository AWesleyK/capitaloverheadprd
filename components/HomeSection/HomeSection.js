// /components/HomeSection/HomeSection.js
import React, { useEffect, useState } from 'react';
import styles from './HomeSection.module.scss';
import Image from '../Shared/SmartImages';
import Link from 'next/link';

const HomeSection = () => {
  const phrases = [
    "Reliable Garage Door Solutions Across the heart of Oklahoma",
    "Best Garage Door Service across southern Oklahoma",
    "Serving rural communities in Oklahoma since 2019"
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFade(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.homeSection}>
      <div className={styles.container}>
        {/* Tagline */}
        <div className={styles.taglineBox}>
          <div className={styles.innerTaglineBox}>
            <p>Where Rural Meets Reliable!</p>
          </div>
        </div>

        {/* 5 Star Image */}
        <div className={styles.ratingImageBox}>
          <Image
            src="/images/google-5-star.png"
            alt="5 Star Rating"
            width={200}
            height={60}
          />
        </div>

        {/* Cycling Phrase Box */}
        <div className={styles.cyclingBox}>
          <p className={fade ? 'fadeOut' : ''}>{phrases[currentPhraseIndex]}</p>
        </div>

        {/* Bottom-left Logo and Call Now */}
        <div className={styles.logoBox}>
          <Link href="tel:4054560399">
            <Image
              src="/images/Dino_Doors_Logo_Partial.png"
              alt="Call Now Logo"
              width={160}
              height={160}
            />
            <div>Call Now!</div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
