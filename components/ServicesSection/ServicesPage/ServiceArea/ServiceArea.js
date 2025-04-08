// /components/ServiceSection/ServiceArea/ServiceArea.js
import React from 'react';
import styles from './ServiceArea.module.scss';
import Link from 'next/link';

const ServiceArea = () => {
  const cities = [
    "Duncan, OK",
    "Foster, OK",
    "Norman, OK",
    "Purcell, OK",
    "Springer, OK",
    "Davis, OK",
    "Katie, OK",
    "Velma, OK",
    "Wayne, OK",
    "Marlow, OK",
    "Pauls Valley, OK",
    "Ardmore, OK",
    "Bradley, OK",
    "Lindsay, OK",
    "Maysville, OK",
    "Stratford, OK",
    "Wynnewood, OK",
    "Elmore City, OK",
    "Ratliff City, OK"
  ];

  return (
    <section className={styles.mapSection}>
      <h2 className={styles.heading}>Where We Serve</h2>

      <div className={styles.mapContentWrapper}>
        <p className={styles.description}>We proudly service a wide range of communities across Oklahoma!</p>
        <div className={styles.mapContainer}>
  <img
  className={styles.mapEmbed}
  src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&sensor=false&language=en&scale=2&key=${process.env.GOOGLE_API_KEY}&center=34.75,-97.5&zoom=7&visible=Hobart,OK|Chickasha,OK|Norman,OK|Lawton,OK&path=color:0x1F8EFF70|weight:2|fillcolor:0x1F8EFF40|34.289050,-98.142148|34.071020,-97.562616|34.071020,-96.933457|34.332638,-96.827288|34.637126,-96.827288|35.337508,-96.930586|35.337508,-97.671595|34.681344,-98.142148|34.289050,-98.142148`}
/>
</div>


        <ul className={styles.serviceList}>
          {cities.map((city, idx) => (
            <li key={idx} className={styles.cityItem}>{city}</li>
          ))}
        </ul>
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
