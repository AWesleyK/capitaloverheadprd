// /pages/index.js
import React from 'react';
import HomeSection from '../components/HomeSection/HomeSection';
import AboutSection from '../components/AboutSection/AboutSection';
import ContactSection from '../components/ContactSection/ContactSection';
import ApplySection from '../components/ApplySection/ApplySection';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import PromotionSection from '../components/PromotionSection/PromotionSection';

const HomePage = () => {
  return (
    <>
      <div id="home">
        <HomeSection />
      </div>
      <div>
        <ContactSection />
      </div>
      <div>
        <PromotionSection />
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
    </>
  );
};

export default HomePage;
