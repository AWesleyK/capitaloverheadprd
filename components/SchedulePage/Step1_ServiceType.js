import React, { useState, useEffect } from 'react';
import styles from './Step1_ServiceType.module.scss';

const Step1_ServiceType = ({ serviceType, setServiceType, onNext, setUnavailableDays, setPoints, serviceArray, setServiceArray }) => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setTimeout(async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        setError(`Error loading services: ${error.message}`);
      }
      setLoading(false);
    }, 1000);
    };
  
    fetchServices();
  }, []);
  

  
  const handleServiceTypeSelect = (service) => {
    setServiceArray([...serviceArray, { name: service.name, price: service.price }]);
    setPoints(service.points);
    setServiceType(service.name);
    setUnavailableDays(service.unavailableDays);
    if(service.name !== "Special") {
      onNext();
    } else {
      window.location.href = `tel:${service.phoneNumber}`; 
    }
  };
  

  if (error) {
    return <div>Error loading services: {error}</div>;
  }

  return (
    <div className={styles.container}>
          {loading ? (
      <div className={styles.loader}></div>
    ) : (
      <div className={styles.container}>
      <h2 className={styles.head}>Select Service Type</h2>
      <div className={styles.serviceTypeContainer}>
        {services.map(service => (
          <div
            key={service._id.$oid}
            className={`${styles.serviceTypeCard} ${serviceType === service.name ? styles.selected : ''}`}
            onClick={() => handleServiceTypeSelect(service)}
            style={{ userSelect: 'none' }}
          >
            <h3>{service.name} - ${service.price}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
      </div>

      )}
    </div>
  );
};

export default Step1_ServiceType;
