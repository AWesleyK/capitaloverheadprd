// /components/Layout/Layout.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import navData from '../../data/nav-data.json';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './Layout.module.scss';
import SiteBanner from './SiteBanner';

const Layout = ({ children }) => {
  const services = navData.services;
  const catalogTypes = navData.catalogTypes;

  return (
    <>
      <Head>
        <link rel="icon" href="/Dino_Doors_Logo_No_bg.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Dino Doors Garage Doors and More" />
        <title>Dino Doors</title>
      </Head>

      <div className={styles.stickyContainer}>
        <Navbar services={services} catalogTypes={catalogTypes} />
        <SiteBanner />
      </div>

      <main className={styles.main}>{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
