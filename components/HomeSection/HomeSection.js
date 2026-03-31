// /components/HomeSection/HomeSection.js
import React, { useEffect, useState } from 'react';
import styles from './HomeSection.module.scss';
import Image from '../Shared/SmartImages';
import Link from 'next/link';
import ReviewsCarousel from '../ReviewsCarousel';

const GOOGLE_REVIEWS_FALLBACK_URL =
    "https://www.google.com/search?sca_esv=2df7ce30d2edfc27&rlz=1C1VDKB_enUS940US940&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQC5nFziusos4HBfs_oFulEqkn_aXPIa0xfM30L_CFEF6MDET2Q5fW-3eQcdCMLpsrJfHMksddKrsLuewTn6B3g2-CmC&q=Dino+Doors+Reviews&sa=X&ved=2ahUKEwi5xJKu896SAxWLkyYFHQBuKiEQ0bkNegQIOBAH&biw=1424&bih=911&dpr=1";

const HomeSection = () => {
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
          console.error(
              'Failed to fetch reviews:',
              response.status,
              errorData.error_message || response.statusText
          );
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  return (
      <section className={styles.homeSection}>
        {/* Background Decorative Elements */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        
        <div className={styles.container}>
          <div className={styles.mainContent}>
            {/* Hero Section with Mascot */}
            <div className={styles.heroWrapper}>
              <div className={styles.heroImageBox}>
                <Image
                    src="/images/HeroBox.png"
                    alt="Dino Doors Hero Graphic"
                    width={800}
                    height={448}
                    priority
                />
              </div>
              
              <div className={styles.mascotWrapper}>
                <Image
                    src="/images/dino guy transparent background.png"
                    alt="Dino Doors Mascot"
                    width={280}
                    height={420}
                />
              </div>
            </div>

            {/* Floating Info Cards */}
            <div className={styles.floatingActions}>
              {/* Phone / Call Card */}
              <div className={styles.ctaCard}>
                <Link href="tel:4054560399" className={styles.callBadge}>
                  <div className={styles.logoWrap}>
                    <Image
                        src="/images/Dino_Doors_Logo_No_bg.png"
                        alt="Dino Doors Logo"
                        width={200}
                        height={200}
                    />
                  </div>
                  <div className={styles.callDetails}>
                    <span className={styles.phone}>(405) 456-0399</span>
                    <span className={styles.tapToCall}>TAP TO CALL NOW</span>
                  </div>
                </Link>
              </div>

              {/* Reviews Card */}
              <div className={styles.ratingCard}>
                {!loadingReviews && reviewData?.reviews?.length > 0 ? (
                    <div className={styles.carouselContainer}>
                        <ReviewsCarousel
                            reviews={reviewData.reviews}
                            googleUrl={reviewData.url}
                        />
                    </div>
                ) : (
                    !loadingReviews && (
                        <a
                            href={reviewData?.url || GOOGLE_REVIEWS_FALLBACK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.reviewFallback}
                        >
                          {reviewData?.rating ? (
                              <div className={styles.fallbackContent}>
                                <div className={styles.stars}>{"★".repeat(Math.round(reviewData.rating))}</div>
                                <p>Rated {reviewData.rating}/5 on Google</p>
                                <span>Based on {reviewData.user_ratings_total} reviews</span>
                              </div>
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
            </div>
          </div>
        </div>

        {/* Transition Overlay to Next Section */}
        <div className={styles.bottomOverlay} />
      </section>
  );
};

export default HomeSection;