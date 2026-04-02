// /components/HomeSection/HomeSection.js
import React from 'react';
import styles from './HomeSection.module.scss';
import Image from '../Shared/SmartImages';
import Link from 'next/link';
import ReviewsMarquee from '../ReviewsMarquee';
import { FaExternalLinkAlt, FaFacebook } from 'react-icons/fa';

const GOOGLE_REVIEWS_FALLBACK_URL =
    "https://www.google.com/search?sca_esv=2df7ce30d2edfc27&rlz=1C1VDKB_enUS940US940&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQC5nFziusos4HBfs_oFulEqkn_aXPIa0xfM30L_CFEF6MDET2Q5fW-3eQcdCMLpsrJfHMksddKrsLuewTn6B3g2-CmC&q=Dino+Doors+Reviews&sa=X&ved=2ahUKEwi5xJKu896SAxWLkyYFHQBuKiEQ0bkNegQIOBAH&biw=1424&bih=911&dpr=1";

const HomeSection = ({ reviews, stats, siteSettings }) => {
  return (
      <section className={styles.homeSection}>
        {/* Background Decorative Elements */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        
        <div className={styles.container}>
          <div className={styles.mainContent}>
            {/* Top Row: Hero & Mascot */}
            <div className={styles.heroLayout}>
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

              {/* Central CTA and Rating Summary */}
              <div className={styles.ctaContainer}>
                <div className={styles.logoBadge}>
                  <Image
                      src="/images/Dino_Doors_Logo_No_bg.png"
                      alt="Dino Doors Logo"
                      width={180}
                      height={180}
                  />
                </div>
                
                <div className={styles.ctaContent}>
                  <h2 className={styles.ctaTitle}>Fast & Professional Garage Door Services</h2>
                  <Link href="tel:4054560399" className={styles.mainPhoneButton}>
                    <span className={styles.phoneLabel}>Call Now:</span>
                    <span className={styles.phoneNumber}>(405) 456-0399</span>
                  </Link>
                  
                  {stats?.averageRating && (
                    <div className={styles.ratingSummary}>
                      <div className={styles.stars}>{"★".repeat(Math.round(stats.averageRating))}</div>
                      <span className={styles.ratingText}>
                        {stats.averageRating}/5 Google Rating ({stats.totalReviewCount} Reviews)
                      </span>
                    </div>
                  )}

                  {siteSettings?.facebookPercentageRecommended > 0 && (
                    <div className={styles.facebookSummary}>
                      <div className={styles.fbIcon}>
                        <FaFacebook />
                      </div>
                      <span className={styles.fbRatingText}>
                        {siteSettings.facebookPercentageRecommended}% Recommend ({siteSettings.facebookReviewCount} Reviews)
                      </span>
                      {siteSettings.facebookReviewsUrl && (
                        <a
                          href={siteSettings.facebookReviewsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fbLink}
                        >
                          {siteSettings.facebookReviewLabel || "View Facebook Reviews"} <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Full Width Marquee */}
            <div className={styles.marqueeSection}>
              {reviews?.length > 0 ? (
                <>
                  <div className={styles.marqueeHeader}>
                    <h3>Real Customer Feedback</h3>
                    <a 
                      href={stats?.url || GOOGLE_REVIEWS_FALLBACK_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.viewAllLink}
                    >
                      View All Reviews <FaExternalLinkAlt />
                    </a>
                  </div>
                  <ReviewsMarquee reviews={reviews} />
                </>
              ) : (
                <div className={styles.fallbackReviews}>
                   {/* Simplified fallback if no reviews fetched */}
                   <a href={stats?.url || GOOGLE_REVIEWS_FALLBACK_URL} target="_blank" rel="noopener noreferrer">
                     ★★★★★ Top Rated Local Garage Door Experts
                   </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transition Overlay to Next Section */}
        <div className={styles.bottomOverlay} />
      </section>
  );
};

export default HomeSection;