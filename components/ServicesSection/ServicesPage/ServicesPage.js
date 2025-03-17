import React from 'react';
import styles from './ServicesPage.module.scss';
import Image from 'next/image';

const ServicesPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Dino Doors Garage Doors and More</h1>
        </div>
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Our Expertise</h2>
          <p className={styles.sectionText}>
            At Dino Doors, we specialize in delivering premium garage door solutions for both residential and commercial properties. Our team of skilled technicians is dedicated to ensuring your doors function seamlessly and securely. Whether you require installation, repair, or maintenance, we have you covered.
          </p>
          <div className={styles.serviceItems}>
            <div className={styles.serviceItem}>
              <Image
                src="/images/service_image_1.jpg"
                alt="Service Icon"
                width={300}
                height={300}
                className={styles.serviceImage}
              />
              <h3 className={styles.serviceItemTitle}>Garage Door Installation and Replacement</h3>
              <p className={styles.serviceItemText}>
                We offer professional garage door installation and replacement services tailored to your requirements. Our experts will guide you through selecting the perfect door from manufacturers like C.H.I, Haas, Garaga, and Amarr. We ensure precise installation to enhance your property&apos;s aesthetic and security.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <Image
                src="/images/service_image_2.jpg"
                alt="Service Icon"
                width={300}
                height={300}
                className={styles.serviceImage}
              />
              <h3 className={styles.serviceItemTitle}>Garage Door Repair</h3>
              <p className={styles.serviceItemText}>
                Is your garage door malfunctioning? Our skilled technicians can swiftly diagnose and repair issues like broken springs, doors off track, and broken cables. We ensure your door functions properly and securely, enhancing safety and convenience.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <Image
                src="/images/service_image_3.jpg"
                alt="Service Icon"
                width={300}
                height={300}
                className={styles.serviceImage}
              />
              <h3 className={styles.serviceItemTitle}>Garage Door Opener Installation and Repair</h3>
              <p className={styles.serviceItemText}>
                We provide garage door opener installation and repair services compatible with Liftmaster and Genie products. Our technicians ensure your door operates smoothly and effortlessly, enhancing convenience and security.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <Image
                src="/images/service_image_4.jpg"
                alt="Service Icon"
                width={300}
                height={300}
                className={styles.serviceImage}
              />
              <h3 className={styles.serviceItemTitle}>Gate Operator Installation and Repair</h3>
              <p className={styles.serviceItemText}>
                Our expertise extends to gate operators. We install and repair gate operators from major brands like Liftmaster, Max Controls, and Apollo. Count on us to enhance the functionality and security of your gates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
