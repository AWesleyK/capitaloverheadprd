import React from 'react';
import styles from './Header.module.scss';
import Link from 'next/link';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={`${styles.h1} ${styles.multiline}`} style={{ display: 'block' }}>
        <Link className={styles.phoneNumber} href="tel:4054560399">
          <span className={styles.icon}>📞</span> (405) 456-0399
        </Link>
        <br />
        <span className={styles.icon}>✉️</span> <span className={styles.email}>services@capitaloverhead.com</span>
      </h1>
    </header>
  );
};

export default Header;
