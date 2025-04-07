// /components/Footer/Footer.js
import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const [quickLinks, setQuickLinks] = useState([]);
  const [hours, setHours] = useState({ store: [], operation: [] });
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, hoursRes] = await Promise.all([
          fetch('/api/content/quicklinks'),
          fetch('/api/content/business-hours')
        ]);

        const linksData = await linksRes.json();
        const hoursData = await hoursRes.json();

        setQuickLinks(linksData);
        setHours(hoursData);
      } catch (err) {
        console.error('Failed to load footer data:', err);
      }
    };

    fetchData();
  }, []);

  const parents = quickLinks
    .filter(link => !link.parent)
    .sort((a, b) => (a.order || 9999) - (b.order || 9999));

  const groupedLinks = quickLinks.reduce((acc, link) => {
    if (!link.parent) return acc;
    if (!acc[link.parent]) acc[link.parent] = [];
    acc[link.parent].push(link);
    return acc;
  }, {});

  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        Powered By{' '}
        <a className={styles.awkward} href="http://scorchseo.com">
          Scorch{' '}
          {!isMobile && (
            <Image
              src="/images/logo192.png"
              alt="Scorch"
              className={styles.logo}
              width={20}
              height={20}
            />
          )}
        </a>
      </div>

      <div className={styles.socialMedia}>
        <a href="https://www.facebook.com/DinoDoorsGarageDoors/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/link_images/f.png" alt="Facebook" className={styles.socialLink} width={30} height={30} />
        </a>
        <a href="https://www.instagram.com/dinodoorsgaragedoors/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/link_images/IG.png" alt="Instagram" className={styles.socialLink} width={30} height={30} />
        </a>
        <a href="https://www.google.com/maps/place/Dino+Doors+Garage+Doors+and+More/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/link_images/G.png" alt="Google" className={styles.socialLink} width={30} height={30} />
        </a>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.contactInfo}>
          <h1>Contact Us</h1>
          <p>Email: services@capitaloverhead.com</p>
          <Link className={styles.phoneNumber} href="tel:4054560399">
            (405) 456-0399
          </Link>
          <p>Address: 307 Main Street<br />
  Elmore City, OK 73433</p>
        </div>
        <div className={styles.hoursWrap}>
          <div className={styles.hoursContainer}>
            <h2>Store Hours</h2>
            <ul>
              {hours.store.map((entry, idx) => (
                <li key={idx}><strong>{entry.day}:</strong> {entry.hours}</li>
              ))}
            </ul>
          </div>

          <div className={styles.hoursContainer}>
            <h2>Hours of Operation</h2>
            <ul>
              {hours.operation.map((entry, idx) => (
                <li key={idx}><strong>{entry.day}:</strong> {entry.hours}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.mapContainer}>
          <h2>Visit Us</h2>
          <iframe
            className={styles.mapEmbed}
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1160.8424275735726!2d-97.39668129576053!3d34.62038704228007!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87b2c03492da3705%3A0x1916f6e4dc7dbccd!2s307%20Main%20St%2C%20Elmore%20City%2C%20OK%2073433!5e0!3m2!1sen!2sus!4v1744059482432!5m2!1sen!2sus"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className={styles.companyLogo}>
          <Image
            src="/images/Dino_Doors_Logo_Full.png"
            alt="Dino Doors Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>

      <div className={styles.quickLinksWrapper}>
        <h2>Quick Links</h2>
        <div className={styles.quickLinksGrid}>
          {parents.map((parent) => (
            <div key={parent.label} className={styles.linkColumn}>
              <Link href={parent.path} className={styles.parentLink}>
                {parent.label}
              </Link>
              {groupedLinks[parent.label]?.sort((a, b) => a.label.localeCompare(b.label)).map((child, idx) => (
                <Link key={idx} href={child.path} className={styles.childLink}>
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
