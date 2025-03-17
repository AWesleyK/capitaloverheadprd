import React from 'react';
import Head from 'next/head';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar'; // Add this import
import Footer from '../Footer/Footer';
import NavbarSplit from '../NavbarSplit/NavbarSplit';
import styles from './Layout.module.scss';

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/Dino_Doors_Logo_No_bg.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Dino Doors Garage Doors and More" />
        <title>Dino Doors</title>
      </Head>
      <div className={styles.stickyContainer}>
        {/*<Header />*/}
        <Navbar />
      </div>
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
