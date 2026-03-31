// /pages/index.js
import React from 'react';
import { GoogleReviewClient } from '@infinite-dev/google-review-api';
import HomeSection from '../components/HomeSection/HomeSection';
import AboutSection from '../components/AboutSection/AboutSection';
import ContactSection from '../components/ContactSection/ContactSection';
import ApplySection from '../components/ApplySection/ApplySection';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import PromotionSection from '../components/PromotionSection/PromotionSection';
import ServiceArea from '../components/ServicesSection/ServicesPage/ServiceArea/ServiceArea';
import FAQSection from '../components/FAQSection/FAQSection';
import { CITY_LIST } from '../lib/cities';
import navData from '../data/nav-data.json';

export async function getStaticProps() {
  let reviews = [];
  let stats = null;

  try {
    const token = process.env.CLIENT_GBP_REVIEWS_TOKEN;
    if (token) {
      const client = new GoogleReviewClient(undefined, token);

      // Attempt to fetch 5-star reviews first
      let reviewsData = [];
      try {
        reviewsData = await client.getFiveStarReviews();
        // If no 5-star reviews, try getting all reviews
        if (!reviewsData || reviewsData.length === 0) {
          const all = await client.getReviews();
          reviewsData = all?.reviews || [];
        }
      } catch (e) {
        console.warn('Failed to fetch 5-star reviews, falling back to all reviews:', e.message);
        const all = await client.getReviews().catch(() => null);
        reviewsData = all?.reviews || [];
      }

      const statsData = await client.getStats().catch(() => null);

      reviews = reviewsData.slice(0, 5); // Take top 5
      stats = statsData;
    }
  } catch (error) {
    console.error('Error in getStaticProps fetching reviews:', error);
  }

  return {
    props: {
      faqs: navData.faqs || [],
      reviews,
      stats,
    },
    revalidate: 86400, // Revalidate daily
  };
}

const HomePage = ({ faqs, reviews, stats }) => {
  return (
    <>
      <div id="home">
        <HomeSection reviews={reviews} stats={stats} />
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
        <FAQSection initialFaqs={faqs} />
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
