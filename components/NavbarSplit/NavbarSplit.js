import React from 'react';
import styles from './NavbarSplit.module.scss';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className={styles.header}>
      <div>
        <Image
          className={styles.logo}
          src="/images/G_5_Star.png"
          alt="Logo"
          width={160}
          height={80}
        />
  </div>
    </header>
  );
};

export default Header;
