import React from 'react';
import styles from './AboutDetail.module.scss';

const ExpertiseSubComponent = ({ yearsOfExperience }) => {
  return (
    <div>
      <h3 className={styles.h3}>Expertise</h3>
      <p>
        Our team at Capital Overhead brings a wealth of experience to the garage door and gate industry. With over 10 years in the field, we have honed our skills to provide top-notch solutions to our clients. Our technicians undergo regular training to stay updated with the latest industry trends and technologies.
      </p>
      {/* Add more details or images related to expertise if needed */}
    </div>
  );
};

export default ExpertiseSubComponent;
