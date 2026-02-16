// /components/HomeSection/HomeSection.js
import React, { useEffect, useState } from 'react';
import styles from './HomeSection.module.scss';
import Image from '../Shared/SmartImages';
import Link from 'next/link';
import ReviewsCarousel from '../ReviewsCarousel';

const GOOGLE_REVIEWS_FALLBACK_URL = "https://www.google.com/search?sca_esv=2df7ce30d2edfc27&rlz=1C1VDKB_enUS940US940&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQC5nFziusos4HBfs_oFulEqkn_aXPIa0xfM30L_CFEF6MDET2Q5fW-3eQcdCMLpsrJfHMksddKrsLuewTn6B3g2-CmC&q=Dino+Doors+Reviews&sa=X&ved=2ahUKEwi5xJKu896SAxWLkyYFHQBuKiEQ0bkNegQIOBAH&biw=1424&bih=911&dpr=1";

const HomeSection = () => {
  const phrases = [
    "Reliable Garage Door Solutions Across the heart of Oklahoma",
    "Best Garage Door Service across southern Oklahoma",
    "Serving rural communities in Oklahoma since 2019"
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/google-reviews');
        if (response.ok) {
          const data = await response.json();
          setReviewData(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch reviews:', response.status, errorData.error_message || response.statusText);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();

    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFade(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.homeSection}>
      <div className={styles.container}>
        {/* Tagline */}
        <div className={styles.taglineBox}>
          <div className={styles.innerTaglineBox}>
            <p>Where Rural Meets Reliable!</p>
          </div>
        </div>

        {/* Google Reviews Carousel or Fallback */}
        <div className={styles.ratingImageBox}>
          {!loadingReviews && reviewData?.reviews?.length > 0 ? (
            <ReviewsCarousel
              reviews={reviewData.reviews}
              googleUrl={reviewData.url}
            />
          ) : (
            !loadingReviews && (
              <a 
                href={reviewData?.url || GOOGLE_REVIEWS_FALLBACK_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.reviewFallback}
              >
                {reviewData?.rating ? (
                  <span>Rated {reviewData.rating}★ on Google ({reviewData.user_ratings_total} reviews)</span>
                ) : (
                  <div className={styles.staticStars}>
                    <span>★★★★★</span>
                    <p>Top Rated on Google</p>
                  </div>
                )}
              </a>
            )
          )}
        </div>

        {/* Cycling Phrase Box */}
        <div className={styles.cyclingBox}>
          <p className={fade ? 'fadeOut' : ''}>{phrases[currentPhraseIndex]}</p>
        </div>

        {/* Bottom-left Logo and Call Now */}
        <div className={styles.logoBox}>
          <Link href="tel:4054560399">
            <Image
              src="/images/Dino_Doors_Logo_Partial.png"
              alt="Call Now Logo"
              width={160}
              height={160}
            />
            <div>Call Now!</div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
