// /components/ServiceSection/ServiceArea/ServiceArea.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './ServiceArea.module.scss';
import Link from 'next/link';
import { normalizeCity } from '../../../../lib/cities';
import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

const ServiceArea = ({ cities = [], intro, isHomePage, hideHeading }) => {
  const list = Array.isArray(cities) && cities.length > 0 ? cities : [];
  const [activeIndices, setActiveIndices] = useState(new Set());
  const cardRefs = useRef([]);

  useEffect(() => {
    // Only set up the observer on touch-capable or small screens if desired, 
    // but the SCSS will handle the visual part via media queries.
    const observerOptions = {
      root: null,
      // Targets the middle portion of the screen
      rootMargin: '-35% 0% -35% 0%',
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      setActiveIndices((prev) => {
        const next = new Set(prev);
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index'), 10);
          if (entry.isIntersecting) {
            next.add(index);
          } else {
            next.delete(index);
          }
        });
        return next;
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Filter out nulls and observe
    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [list]);

  return (
    <section className={`${styles.serviceAreaSection} ${isHomePage ? styles.homeVariant : ''}`}>
      {!hideHeading && (
        <h2 className={styles.heading}>
          {isHomePage ? (
            <Link href="/services/service-area" className={styles.headingLink}>
              Where We Serve
            </Link>
          ) : (
            "Where We Serve"
          )}
        </h2>
      )}

      <div className={styles.mapContentWrapper}>
        {intro !== "" && (
          <p className={styles.description}>
            {intro || 'We proudly service a wide range of communities across Oklahoma!'}
          </p>
        )}
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
              <Link 
                key={idx} 
                href={`/service-area/${slug}`} 
                className={`${styles.cityCard} ${activeIndices.has(idx) ? styles.active : ''}`}
                ref={(el) => (cardRefs.current[idx] = el)}
                data-index={idx}
              >
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
        <div className={styles.buttonGroup}>
          <Link href="tel:4054560399" className={styles.callButton}>Call Now</Link>
          {isHomePage && (
            <Link href="/services/service-area" className={styles.secondaryButton}>
              Full Service Area Map
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceArea;
