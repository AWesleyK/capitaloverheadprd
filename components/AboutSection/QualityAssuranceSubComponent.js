import React from 'react';
import styles from './AboutDetail.module.scss';
import { FaShieldAlt } from 'react-icons/fa';

const QualityAssuranceSubComponent = () => {
  return (
    <>
      <div className={styles.iconWrapper}>
        <FaShieldAlt />
      </div>
      <h3 className={styles.h3}>Quality Assurance</h3>
      <p className={styles.detailText}>
        Quality is non-negotiable for us. We source premium materials and products for all our projects, ensuring that the installations are built to last. Our meticulous attention to detail and rigorous quality checks at each stage of the process ensure that our solutions meet the highest standards.
      </p>
    </>
  );
};

export default QualityAssuranceSubComponent;
