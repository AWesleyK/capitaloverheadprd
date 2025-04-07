// pages/service-area.js
import React from 'react';
import Head from 'next/head';
import ServiceArea from '../../components/ServicesSection/ServicesPage/ServiceArea/ServiceArea';

const ServiceAreaPage = () => {
  return (
    <>
      <Head>
        <title>Service Area | Dino Doors Garage Doors and More</title>
        <meta
          name="description"
          content="Explore the service area of Dino Doors. We proudly serve homes and businesses across southern and central Oklahoma from our home base in Elmore City."
        />
      </Head>
      <ServiceArea />
    </>
  );
};

export default ServiceAreaPage;
