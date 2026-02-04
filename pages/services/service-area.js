// pages/services/service-area.js
import React from 'react';
import Head from 'next/head';
import ServiceArea from '../../components/ServicesSection/ServicesPage/ServiceArea/ServiceArea';
import { CITY_LIST } from '../../lib/cities';

const ServiceAreaPage = () => {
  const introCopy =
    "Find trusted, local garage door service across Southern and Central Oklahoma. From repairs and tune-ups to new installations, our team comes to you—fast, friendly, and done right.";

  return (
    <>
      <Head>
        <title>Service Areas We Serve in Oklahoma | Dino Doors</title>
        <meta
          name="description"
          content="Browse our Oklahoma service areas. Dino Doors provides reliable garage door repair, installation, and maintenance across local cities including Elmore City, Duncan, Ardmore, and more."
        />
      </Head>
      <main>
        <ServiceArea cities={CITY_LIST} intro={introCopy} />
      </main>
    </>
  );
};

export default ServiceAreaPage;
