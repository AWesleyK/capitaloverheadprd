import React from 'react';
import styles from './AboutDetail.module.scss';
import { FaHardHat } from 'react-icons/fa';

const SafetyMeasuresSubComponent = () => {
  return (
    <>
      <div className={styles.iconWrapper}>
        <FaHardHat />
      </div>
      <h3 className={styles.h3}>Safety Measures</h3>
      <p className={styles.detailText}>
        Safety is paramount when it comes to garage doors and gates. Our team adheres to industry best practices and safety guidelines to ensure the safety of both our technicians and the property owners. We prioritize secure installations and regularly inspect and maintain existing doors and gates to prevent any potential hazards.
      </p>
    </>
  );
};

export default SafetyMeasuresSubComponent;
