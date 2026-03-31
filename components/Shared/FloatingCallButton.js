import React from 'react';
import styles from './FloatingCallButton.module.scss';
import { FaPhoneAlt } from 'react-icons/fa';

const FloatingCallButton = () => {
  return (
    <a href="tel:4054560399" className={styles.floatingButton} aria-label="Call Us Now">
      <div className={styles.iconWrapper}>
        <FaPhoneAlt />
      </div>
      <span className={styles.label}>Call Us</span>
    </a>
  );
};

export default FloatingCallButton;
