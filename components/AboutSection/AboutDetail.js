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
      <div className={styles.backgroundImageWrapper}>
        <div className={styles.content}>
          <h2 className={styles.detailHeading}>Our Core Values</h2>
          
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
        </div>
      </div>
    </section>
  );
};

export default AboutDetail;
