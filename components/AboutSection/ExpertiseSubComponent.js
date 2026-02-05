import React from 'react';
import styles from './AboutDetail.module.scss';
import { FaUserCheck } from 'react-icons/fa';

const ExpertiseSubComponent = ({ yearsOfExperience }) => {
  return (
    <>
      <div className={styles.iconWrapper}>
        <FaUserCheck />
      </div>
      <h3 className={styles.h3}>Expertise</h3>
      <p className={styles.detailText}>
        Our team at Dino Doors brings a wealth of experience to the garage door and gate industry. With over 10 years in the field, we have honed our skills to provide top-notch solutions to our clients. Our technicians undergo regular training to stay updated with the latest industry trends and technologies.
      </p>
    </>
  );
};

export default ExpertiseSubComponent;
