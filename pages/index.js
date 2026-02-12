// /pages/index.js
import React from 'react';
import HomeSection from '../components/HomeSection/HomeSection';
import AboutSection from '../components/AboutSection/AboutSection';
import ContactSection from '../components/ContactSection/ContactSection';
import ApplySection from '../components/ApplySection/ApplySection';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import PromotionSection from '../components/PromotionSection/PromotionSection';
import ServiceArea from '../components/ServicesSection/ServicesPage/ServiceArea/ServiceArea';
import FAQSection from '../components/FAQSection/FAQSection';
import { CITY_LIST } from '../lib/cities';

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
      <div id="faq">
        <FAQSection />
      </div>
      <div id="service-area">
        <ServiceArea 
          cities={CITY_LIST} 
          isHomePage={true} 
          intro="Dino Doors brings expert garage door repair and installation right to your doorstep. We proudly serve communities across the heart of Oklahoma with fast, reliable service."
        />
      </div>
      {/*<div id="apply">
        <ApplySection />
      </div>*/}
    </>
  );
};

export default HomePage;
