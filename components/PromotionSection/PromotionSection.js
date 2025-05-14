import React, { useEffect, useState } from 'react';
import styles from './PromotionSection.module.scss';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const PHONE_NUMBER = "4054560399";

const PromotionSection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/promotions/get');
        const data = await res.json();
        setImages(data.map((img) => img.url));
      } catch (err) {
        console.error('Failed to fetch promotion images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleInteraction = () => {
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 8000);
  };

  if (loading) {
    return (
      <section className={styles.promotionSection}>
        <div className={styles.loader}>Loading promotions...</div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className={styles.promotionSection}>
        <div className={styles.placeholder}>Check back soon for limited-time offers!</div>
      </section>
    );
  }

  return (
    <section className={styles.promotionSection}>
      <h1 className={styles.sectionTitle}>Dino Deals</h1>
      <div className={styles.carouselWrapper}>
        <Carousel
          autoPlay={autoplay}
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={4000}
          swipeable
          emulateTouch
          showArrows
          onClickItem={handleInteraction}
          onSwipeEnd={handleInteraction}
          onChange={handleInteraction}
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button onClick={onClickHandler} className={`${styles.arrow} ${styles.left}`} aria-label={label}>
                ◀
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button onClick={onClickHandler} className={`${styles.arrow} ${styles.right}`} aria-label={label}>
                ▶
              </button>
            )
          }
        >
          {images.map((src, index) => (
            <div key={index} className={styles.slide}>
              <a href={`tel:${PHONE_NUMBER}`}>
                <img src={src} alt={`Promotion ${index + 1}`} />
              </a>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default PromotionSection;
