// /components/Footer/Footer.js
import React, { useEffect, useState } from "react";
import styles from "./Footer.module.scss";
import Image from "../Shared/SmartImages";
import Link from "next/link";

const Footer = () => {
  const [quickLinks, setQuickLinks] = useState([]);
  const [hours, setHours] = useState({ store: [], operation: [] });
  const [contactInfo, setContactInfo] = useState(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, hoursRes, contactRes] = await Promise.all([
          fetch("/api/content/quicklinks"),
          fetch("/api/content/business-hours/public"),
          fetch("/api/content/site-settings/public"),
        ]);

        const linksData = await linksRes.json();
        const hoursData = await hoursRes.json();
        const contactData = await contactRes.json();

        setQuickLinks(linksData || []);
        setHours(hoursData || { store: [], operation: [] });
        setContactInfo(contactData); // can be null on first run
      } catch (err) {
        console.error("Failed to load footer data:", err);
      }
    };

    fetchData();
  }, []);

  const regularParents = quickLinks
    .filter((link) => !link.parent && link.order !== 9999)
    .sort((a, b) => (a.order || 9999) - (b.order || 9999));

  const blogParents = quickLinks
    .filter((link) => !link.parent && link.order === 9999)
    .sort((a, b) => a.label.localeCompare(b.label));

  const groupedLinks = quickLinks.reduce((acc, link) => {
    if (!link.parent) return acc;
    if (!acc[link.parent]) acc[link.parent] = [];
    acc[link.parent].push(link);
    return acc;
  }, {});

  // Fallbacks in case DB is empty or API returns null
  const email = contactInfo?.email || "Jon@dinodoors.net";
  const phone = contactInfo?.phone || "4054560399";
  const phoneDisplay = contactInfo?.phoneDisplay || "(405) 456-0399";
  const addressLine1 = contactInfo?.addressLine1 || "307 S Main Street";
  const addressLine2 = contactInfo?.addressLine2 || "Elmore City, OK 73433";

  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        Powered By{" "}
        <a className={styles.awkward} href="http://scorchseo.com">
          Scorch{" "}
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
        <a
          href="https://www.facebook.com/DinoDoorsGarageDoors/"
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
          href="https://www.instagram.com/dinodoorsgaragedoors/"
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
          href="https://www.google.com/maps/place/Dino+Doors+Garage+Doors+and+More/"
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
        <div className={styles.contactInfo}>
          <h1>Contact Us</h1>

          <p>
            Email: <a href={`mailto:${email}`}>{email}</a>
          </p>

          <p>
            Phone Number:{" "}
            <Link className={styles.phoneNumber} href={`tel:${phone}`}>
              {phoneDisplay}
            </Link>
          </p>

          <p>
            Address: {addressLine1}
            <br />
            {addressLine2}
          </p>
        </div>

        <div className={styles.hoursWrap}>
          <div className={styles.hoursContainer}>
            <h2>Store Hours</h2>
            <ul>
              {hours.store.map((entry, idx) => (
                <li key={idx}>
                  <strong>{entry.day}:</strong> {entry.hours}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.hoursContainer}>
            <h2>Hours of Operation</h2>
            <ul>
              {hours.operation.map((entry, idx) => (
                <li key={idx}>
                  <strong>{entry.day}:</strong> {entry.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.mapContainer}>
          <h2>Visit Us</h2>
          <iframe
            className={styles.mapEmbed}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.3627813287135!2d-97.39932952377676!3d34.620271487523375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87b2c0349438e529%3A0xb6943bc1ae39fc34!2s307%20S%20Main%20St%2C%20Elmore%20City%2C%20OK%2073433!5e0!3m2!1sen!2sus!4v1763048877439!5m2!1sen!2sus"
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
          {regularParents.map((parent) => (
            <div key={parent.label} className={styles.linkColumn}>
              <Link href={parent.path} className={styles.parentLink}>
                {parent.label}
              </Link>
              {groupedLinks[parent.label]
                ?.sort((a, b) => a.label.localeCompare(b.label))
                .map((child, idx) => (
                  <Link
                    key={idx}
                    href={child.path}
                    className={styles.childLink}
                  >
                    {child.label}
                  </Link>
                ))}
            </div>
          ))}
        </div>

        {blogParents.length > 0 && (
          <div className={styles.blogLinksSection}>
            <h2>Blogs</h2>
            <div className={styles.quickLinksGrid}>
              {blogParents.map((parent) => (
                <div key={parent.label} className={styles.linkColumn}>
                  <Link href={parent.path} className={styles.parentLink}>
                    {parent.label}
                  </Link>
                  {groupedLinks[parent.label]
                    ?.sort((a, b) => a.label.localeCompare(b.label))
                    .map((child, idx) => (
                      <Link
                        key={idx}
                        href={child.path}
                        className={styles.childLink}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
