import React from 'react';
import styles from './PricingSection.module.scss';

const PricingSection = () => {
  return (
    <div className={styles.pricingSection}>
      <div className={styles.content}>
        <div className={styles.taglineContainer}>
          <h2 className={styles.tagline}>Pricing</h2>

          <hr className={styles.separator} />

          <div className={styles.section}>
            <h3 className={styles.subheading}>Trailer Rental</h3>
            <p className={styles.price}>Day Rate: $350</p>
          </div>

          <hr className={styles.separator} />

          <div className={styles.section}>
            <h3 className={styles.subheading}>Junk Removal Service</h3>
            <p className={styles.price}>Service Rate: $450</p>
          </div>

          <hr className={styles.separator} />

          <div className={styles.section}>
            <h3 className={styles.subheading}>Call Now for Specialty Pricing!</h3>
          </div>

          <hr className={styles.separator} />

          <div className={styles.section}>
            <h3 className={styles.subheading}>Additional Charges</h3>
            <div className={styles.additionalChargesContainer}>
              <div className={styles.row}>
                <div className={styles.column}>
                  <p className={styles.charge}>Mattress: $40</p>
                  <p className={styles.charge}>Sofa: $40</p>
                  <p className={styles.charge}>Recliner: $40</p>
                  <p className={styles.charge}>Box Spring: $40</p>
                </div>
                <div className={styles.column}>
                  <p className={styles.charge}>Small Tires: $8</p>
                  <p className={styles.charge}>15-30 inch Tires: $20</p>
                  <p className={styles.charge}>30-40 inch Tires: $50</p>
                  <p className={styles.charge}>40-48 inch Tires: $80</p>
                  <p className={styles.charge}>Larger than 48 inch Tires: Rates Vary</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
