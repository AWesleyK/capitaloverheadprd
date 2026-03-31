import React from 'react';
import styles from './ReviewsMarquee.module.scss';
import { FaStar, FaGoogle } from 'react-icons/fa';

const ReviewsMarquee = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  // Double the reviews to create a seamless infinite loop
  const displayReviews = [...reviews, ...reviews];

  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marqueeTrack}>
        {displayReviews.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{review.author_name}</span>
                <span className={styles.reviewDate}>{review.relative_time_description}</span>
              </div>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} size={12} />
                ))}
              </div>
            </div>
            <p className={styles.reviewText}>{review.text}</p>
            <div className={styles.googleAttribution}>
              <FaGoogle className={styles.googleIcon} color="#4285F4" />
              <span>Google Review</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsMarquee;
