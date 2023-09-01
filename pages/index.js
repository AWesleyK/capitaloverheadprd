import React from 'react';
import Layout from '../components/Layout/Layout';
import HomeSection from '../components/HomeSection/HomeSection';
import AboutSection from '../components/AboutSection/AboutSection';
import ContactSection from '../components/ContactSection/ContactSection';
import ApplySection from '../components/ApplySection/ApplySection';
import ServicesSection from '../components/ServicesSection/ServicesSection';

const HomePage = () => {
  return (
    <Layout>
      <div id="home">
        <HomeSection />
      </div>
      <div>
        <ContactSection />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      {/*<div id="apply">
        <ApplySection />
  </div>*/}
    </Layout>
  );
};

export default HomePage;
