// /components/Layout/Layout.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import navData from '../../data/nav-data.json';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './Layout.module.scss';
import SiteBanner from './SiteBanner';
import FloatingCallButton from '../Shared/FloatingCallButton';

const Layout = ({ children }) => {
  const services = navData.services;
  const catalogTypes = navData.catalogTypes;

  return (
    <>
      <Head>
        <link rel="icon" href="/Dino_Doors_Logo_No_bg.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Default title/description — individual pages override these */}
        <title>Dino Doors | Garage Door Repair & Installation in Oklahoma</title>
        <meta key="description" name="description" content="Dino Doors provides expert garage door repair, installation, and maintenance across Oklahoma. Fast, reliable service — call (405) 456-0399." />
        {/* OG defaults */}
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Dino Doors" />
        <meta key="og:image" property="og:image" content="https://dinodoors.net/transparent-icon.png" />
        <meta key="og:image:alt" property="og:image:alt" content="Dino Doors logo" />
        {/* Twitter defaults */}
        <meta key="twitter:card" name="twitter:card" content="summary" />
        <meta key="twitter:image" name="twitter:image" content="https://dinodoors.net/transparent-icon.png" />
      </Head>

      <div className={styles.stickyContainer}>
        <Navbar services={services} catalogTypes={catalogTypes} />
        <SiteBanner />
      </div>

      <main className={styles.main}>{children}</main>
      <FloatingCallButton />
      <Footer />
    </>
  );
};

export default Layout;
