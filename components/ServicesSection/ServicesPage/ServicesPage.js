import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from './ServicesPage.module.scss';
import Image from '../../Shared/SmartImages';
import Link from 'next/link';
import { FaSearch, FaWrench, FaCogs, FaShieldAlt, FaClock, FaChevronRight } from 'react-icons/fa';

const ServicesPage = ({ initialServices = [] }) => {
  const [services, setServices] = useState(initialServices);
  const [filteredServices, setFilteredServices] = useState(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastLoggedQuery, setLastLoggedQuery] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services/get');
        const data = await res.json();
        setServices(data);
        if (!searchQuery) {
          setFilteredServices(data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };

    if (initialServices.length === 0) {
      fetchServices();
    }
  }, [initialServices, searchQuery]);

  useEffect(() => {
    const filtered = services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);

    const timer = setTimeout(() => {
      const currentQuery = JSON.stringify({ search: searchQuery });

      if (currentQuery !== lastLoggedQuery && searchQuery.length >= 2) {
        fetch("/api/admin/dashboard/logs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: "/services",
            queryParams: {
              search: searchQuery,
            },
          }),
        }).catch((err) => console.error("Failed to log search (services):", err));

        setLastLoggedQuery(currentQuery);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [services, searchQuery]);

  return (
    <>
      <Head>
        <title>Our Services | Dino Doors Garage Doors and More</title>
        <meta name="description" content="Professional garage door and gate services in Oklahoma. From emergency repairs and spring replacement to new installations, Dino Doors has you covered." />
      </Head>

      <div className={styles.servicesPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>Professional Garage Door Services</h1>
            <p>Reliable Repairs, Expert Installations, and Quality Maintenance</p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Introduction Section */}
          <section className={styles.introSection}>
            <h2 className={styles.sectionTitle}>Our Expertise</h2>
            <p className={styles.sectionText}>
              At Dino Doors, we specialize in delivering premium garage door and gate solutions for both residential and commercial properties. Our team of skilled technicians is dedicated to ensuring your systems function seamlessly and securely.
            </p>
          </section>

          {/* Search Section */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchInputContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search our services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Service Grid Section */}
          <section className={styles.serviceGridSection}>
            <div className={styles.serviceItems}>
              {filteredServices.map((service) => (
                <Link key={service._id} href={`/services/${service.slug}`} className={styles.serviceItem}>
                  <div className={styles.serviceCard}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={service.imageUrl || '/images/placeholder.png'}
                        alt={service.name}
                        width={400}
                        height={300}
                        className={styles.serviceImage}
                        unoptimized
                      />
                      <div className={styles.imageOverlay}>
                        <span>View Details <FaChevronRight /></span>
                      </div>
                    </div>
                    <div className={styles.serviceInfo}>
                      <h3 className={styles.serviceItemTitle}>{service.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredServices.length === 0 && (
              <p className={styles.noResults}>No services found matching your search. Please try another term or call us for help!</p>
            )}
          </section>

          {/* Why Choose Us Section */}
          <section className={styles.benefitsSection}>
            <h2 className={styles.benefitsTitle}>Why Choose Dino Doors?</h2>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><FaClock /></div>
                <h3>Same-Day Service</h3>
                <p>We understand that a broken door is an emergency. We offer prompt service to get you back on track.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><FaWrench /></div>
                <h3>Expert Technicians</h3>
                <p>Our team is highly trained and experienced with all major brands and types of garage doors.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><FaShieldAlt /></div>
                <h3>Quality Guaranteed</h3>
                <p>We use only the best parts and stand behind our work with industry-leading warranties.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><FaCogs /></div>
                <h3>Advanced Solutions</h3>
                <p>From smart openers to custom gates, we provide modern solutions for your home or business.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaBox}>
              <h2>Need Immediate Assistance?</h2>
              <p>Our technicians are ready to help you with any garage door or gate issue. Call us today for a free estimate!</p>
              <Link href="tel:4054560399" className={styles.ctaButton}>Call Now: (405) 456-0399</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
