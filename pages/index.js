// /pages/index.js
import React from 'react';
import dbConnect from '../lib/mongoose';
import SiteSettings from '../models/settings/siteSettings';
import { googleReviewClient } from '../lib/GoogleReviewAPi';
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

function formatRelativeTime(createTime) {
  if (!createTime) return '';
  const date = new Date(createTime);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function mapGbpReview(gbpReview) {
  if (!gbpReview) return null;

  // The API returns differently based on its internal routing.
  // GMB API uses: reviewer.displayName, comment, starRating
  // Places API uses: author_name, text, rating
  
  const authorName = gbpReview.reviewer?.displayName || 
                     gbpReview.author_name || 
                     gbpReview.displayName || 
                     'Google User';

  const profilePhoto = gbpReview.reviewer?.profilePhotoUrl || 
                       gbpReview.profile_photo_url || 
                       gbpReview.photoUrl || 
                       null;

  const textContent = gbpReview.comment || 
                      gbpReview.text || 
                      gbpReview.reviewText || 
                      '';

  const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
  const ratingValue = ratingMap[gbpReview.starRating] || 
                      gbpReview.rating || 
                      gbpReview.starRating || 
                      5;

  const relativeTime = gbpReview.relative_time_description || 
                       formatRelativeTime(gbpReview.createTime || gbpReview.updateTime);

  return {
    author_name: authorName,
    profile_photo_url: profilePhoto,
    rating: typeof ratingValue === 'number' ? ratingValue : 5,
    text: textContent,
    relative_time_description: relativeTime
  };
}

export async function getStaticProps() {
  let reviews = [];
  let stats = null;
  let siteSettings = null;

  try {
    await dbConnect();
    const settingsDoc = await SiteSettings.findOne({ key: "siteSettings" }).lean();
    if (settingsDoc) {
      siteSettings = JSON.parse(JSON.stringify(settingsDoc));
    }

    const title = "Dino Doors";
    const reviewResult = await googleReviewClient.getReviewsByTitle(title);
    
    if (reviewResult) {
      reviews = (reviewResult.reviews || [])
        .map(mapGbpReview)
        .filter(Boolean);

      stats = {
        averageRating: reviewResult.averageRating,
        totalReviewCount: reviewResult.totalReviewCount,
        title: reviewResult.title,
        // The title-based result doesn't have a direct URL, 
        // we could try getStats(title) too but it didn't return a URL in tests.
      };
    }
  } catch (error) {
    console.error('Error in getStaticProps fetching reviews:', error);
  }

  return {
    props: {
      faqs: navData.faqs || [],
      reviews,
      stats,
      siteSettings,
    },
    revalidate: 86400, // Revalidate daily
  };
}

const HomePage = ({ faqs, reviews, stats, siteSettings }) => {
  return (
    <>
      <div id="home">
        <HomeSection reviews={reviews} stats={stats} siteSettings={siteSettings} />
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
        <FAQSection initialFaqs={faqs} limit={3} />
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
