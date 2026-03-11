import React from 'react';
import Head from 'next/head';
import MaintenancePlan from '../components/MaintenancePlan/MaintenancePlan';

const MaintenancePlanPage = () => {
  return (
    <>
      <Head>
        <title>Maintenance Plan Enrollment | Dino Doors</title>
        <meta name="description" content="Sign up for Dino Doors maintenance plans to keep your garage door in top shape." />
      </Head>
      <MaintenancePlan />
    </>
  );
};

export default MaintenancePlanPage;
