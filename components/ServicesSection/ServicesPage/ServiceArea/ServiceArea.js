// /components/ServiceSection/ServiceArea/ServiceArea.js
import React from 'react';
import styles from './ServiceArea.module.scss';
import Link from 'next/link';
import { normalizeCity } from '../../../../lib/cities';
import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

const ServiceArea = ({ cities = [], intro }) => {
  const list = Array.isArray(cities) && cities.length > 0 ? cities : [];

  return (
    <section className={styles.serviceAreaSection}>
      <h2 className={styles.heading}>Where We Serve</h2>

      <div className={styles.mapContentWrapper}>
        <p className={styles.description}>
          {intro || 'We proudly service a wide range of communities across Oklahoma!'}
        </p>
        <div className={styles.mapContainer}>
          <img
            className={styles.mapEmbed}
            //src={`https://maps.googleapis.com/maps/api/staticmap?size=800x400&sensor=false&language=en&scale=2&center=34.5,-97.3&zoom=8&key=${process.env.GOOGLE_API_KEY}&path=color:0x1F8EFF70|weight:2|fillcolor:0x1F8EFF40|34.289050,-98.142148|34.071020,-97.562616|34.071020,-96.933457|34.332638,-96.827288|34.637126,-96.827288|35.337508,-96.930586|35.337508,-97.671595|34.681344,-98.142148|34.289050,-98.142148`}
            src={'/images/staticmap.png'}
            alt="Dino Doors service area map"
          />
        </div>

        <div className={styles.cityGrid}>
          {list.map((city, idx) => {
            const slug = normalizeCity(city);
            return (
              <Link key={idx} href={`/service-area/${slug}`} className={styles.cityCard}>
                <div className={styles.cityHeader}>
                  <FaMapMarkerAlt className={styles.markerIcon} />
                  <span className={styles.cityName}>{city}</span>
                </div>
                <span className={styles.cityCta}>
                  View <FaChevronRight className={styles.arrowIcon} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.callToAction}>
        <p className={styles.callText}>
          Don&apos;t see your city? That&apos;s okay, give us a call and we&apos;ll do our best to reach you!
        </p>
        <Link href="tel:4054560399" className={styles.callButton}>Call Now</Link>
      </div>
    </section>
  );
};

export default ServiceArea;
