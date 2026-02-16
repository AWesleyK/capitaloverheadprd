import React from 'react';
import styles from './AboutDetail.module.scss';
import { FaUserCheck } from 'react-icons/fa';

const CustomerFocusSubComponent = () => {
  return (
    <>
      <div className={styles.iconWrapper}>
        <FaUserCheck />
      </div>
      <h3 className={styles.h3}>Customer Focus</h3>
      <p className={styles.detailText}>
        Customer satisfaction is at the heart of everything we do. We believe in open communication and listening to our clients&apos; needs to tailor our solutions accordingly. Our team takes the time to understand the unique requirements of each project and provides personalized recommendations.
      </p>
    </>
  );
};

export default CustomerFocusSubComponent;
