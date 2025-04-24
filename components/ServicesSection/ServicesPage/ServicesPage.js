import React, { useEffect, useState } from 'react';
import styles from './ServicesPage.module.scss';
import Image from '../shared/SmartImage';
import Link from 'next/link';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastLoggedQuery, setLastLoggedQuery] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services/get');
        const data = await res.json();
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };

    fetchServices();
  }, []);

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
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Dino Doors Garage Doors and More</h1>
        </div>
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Our Expertise</h2>
          <p className={styles.sectionText}>
            At Dino Doors, we specialize in delivering premium garage door and gate solutions for both residential and commercial properties. Our team of skilled technicians is dedicated to ensuring your systems function seamlessly and securely.
          </p>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className={styles.serviceItems}>
            {filteredServices.map((service) => (
              <Link key={service._id} href={`/services/${service.slug}`} className={styles.serviceItem}>
                <div className={styles.serviceCard}>
                  <Image
                    src={service.imageUrl || '/images/placeholder.png'}
                    alt={service.name}
                    width={300}
                    height={300}
                    className={styles.serviceImage}
                    unoptimized
                  />
                  <h3 className={styles.serviceItemTitle}>{service.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
