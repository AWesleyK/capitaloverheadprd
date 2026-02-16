import React, { useState, useEffect, useRef } from 'react';
import styles from './ReviewsCarousel.module.scss';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

const ReviewsCarousel = ({ reviews, googleUrl, heading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!isPaused && reviews.length > 1) {
      timeoutRef.current = setTimeout(nextReview, 6000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused, reviews.length]);

  if (!reviews || reviews.length === 0) return null;

  const truncateText = (text, maxLength = 280) => {
    if (text.length <= maxLength) return text;
    return (
      <>
        {text.substring(0, maxLength)}...{' '}
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
          Read more
        </a>
      </>
    );
  };

  return (
    <div
      className={styles.carouselContainer}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevReview();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextReview();
        }
      }}
      role="region"
      aria-label="Google Reviews Carousel"
      aria-live="polite"
    >
      {heading && <h3 className={styles.heading}>{heading}</h3>}
      
      <div className={styles.carouselContent}>
        {reviews.map((review, index) => (
          <div
            key={index}
            className={`${styles.reviewCard} ${index === currentIndex ? styles.active : ''}`}
            aria-hidden={index !== currentIndex}
          >
            <div className={styles.reviewHeader}>
              {review.profile_photo_url && (
                <img
                  src={review.profile_photo_url}
                  alt={review.author_name}
                  className={styles.authorPhoto}
                />
              )}
              <div className={styles.authorInfo}>
                <p className={styles.authorName}>{review.author_name}</p>
                <p className={styles.reviewMeta}>{review.relative_time_description}</p>
              </div>
            </div>
            
            <div className={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} color={i < Math.floor(review.rating) ? '#ffc107' : '#e4e5e9'} />
              ))}
            </div>
            
            <div className={styles.reviewText}>
              {truncateText(review.text)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button
          onClick={prevReview}
          className={styles.navButton}
          aria-label="Previous review"
          type="button"
        >
          <FaChevronLeft />
        </button>
        
        <div className={styles.dots}>
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to review ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              type="button"
            />
          ))}
        </div>

        <button
          onClick={nextReview}
          className={styles.navButton}
          aria-label="Next review"
          type="button"
        >
          <FaChevronRight />
        </button>
      </div>

      <p className={styles.attribution}>Reviews powered by Google</p>
    </div>
  );
};

export default ReviewsCarousel;
