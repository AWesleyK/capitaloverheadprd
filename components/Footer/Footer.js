import React from 'react';
import styles from './Footer.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;


  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        Powered By{' '}
        <a className={styles.awkward} href={'http://scorchseo.com'}>
          Scorch{' '}
          {!isMobile && (
            <Image
              src={'/images/logo192.png'}
              alt="Scorch"
              className={styles.logo}
              width={20}
              height={20}
            />
          )}
        </a>
      </div>
      <div className={styles.socialMedia}>
        <a
          href="https://www.facebook.com/capitaloverhead/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/link_images/f.png"
            alt="Facebook"
            className={styles.socialLink}
            width={30}
            height={30}
          />
        </a>
        <a
          href="https://www.instagram.com/capitaloverhead/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/link_images/IG.png"
            alt="Instagram"
            className={styles.socialLink}
            width={30}
            height={30}
          />
        </a>
        <a
          href="https://www.google.com/maps/place/Capital+Overhead+Doors+and+Gates/@34.6072528,-97.2112981,15z/data=!4m6!3m5!1s0x87b2e776c5a46013:0x3fce84e440e07175!8m2!3d34.6072528!4d-97.2112981!16s%2Fg%2F11ft396n76?entry=ttu"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/link_images/G.png"
            alt="Google"
            className={styles.socialLink}
            width={30}
            height={30}
          />
        </a>
      </div>
      <div className={styles.bottomSection}>
        <div className={styles.boxesContainer}>
          <div className={styles.box}></div>
          <Image
            src={'/images/Capital_Logo_Solid_bg.jpg'}
            alt="Kno More Logo"
            className={styles.companyLogo}
            width={isMobile ? 100 : 250}
            height={isMobile ? 42 : 104}
          />
          <div className={styles.box}></div>
        </div>
        <div className={styles.contactInfo}>
          <h1>Contact Us Today!</h1>
          <p>services@capitaloverhead.com</p>
          <Link className={styles.phoneNumber} href="tel:4054560399">(405) 456-0399</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
