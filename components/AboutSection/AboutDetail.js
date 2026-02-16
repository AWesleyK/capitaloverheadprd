// AboutDetail.js
import React from 'react';
import styles from './AboutDetail.module.scss';
import ExpertiseSubComponent from './ExpertiseSubComponent';
import CustomerFocusSubComponent from './CustomerFocusSubComponent';
import QualityAssuranceSubComponent from './QualityAssuranceSubComponent';
import SafetyMeasuresSubComponent from './SafetyMeasuresSubComponent';

const AboutDetail = () => {
  return (
    <section className={styles.aboutDetailSection}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>Our Core Values</h1>
          <p>Integrity, Quality, and Safety in Every Job We Do.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.container}>
        <div className={styles.introContent}>
          <h2 className={styles.sectionTitle}>What Drives Us</h2>
          <p className={styles.introText}>
            At Dino Doors, we believe that how we do our work is just as important as the work itself. 
            Our core values are the foundation of our company and guide every interaction we have 
            with our customers in southern and central Oklahoma.
          </p>
        </div>

        <div className={styles.detailGrid}>
          <div className={styles.aboutDetailBox}>
            <ExpertiseSubComponent yearsOfExperience={15} />
          </div>
          
          <div className={styles.aboutDetailBox}>
            <CustomerFocusSubComponent />
          </div>
          
          <div className={styles.aboutDetailBox}>
            <QualityAssuranceSubComponent />
          </div>
          
          <div className={styles.aboutDetailBox}>
            <SafetyMeasuresSubComponent />
          </div>
        </div>

        <div className={styles.bottomCta}>
          <p>Experience the Dino Doors difference for yourself.</p>
          <a href="tel:4054560399" className={styles.ctaButton}>Call (405) 456-0399</a>
        </div>
      </div>
    </section>
  );
};

export default AboutDetail;
