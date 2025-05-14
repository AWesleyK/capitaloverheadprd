import React, { useEffect, useState } from 'react';
import styles from './PromotionSection.module.scss';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

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

  // Pause autoplay on manual interaction
  const handleInteraction = () => {
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 8000); // resume after 8s
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
        >
          {images.map((src, index) => (
            <div key={index} className={styles.slide}>
              <img src={src} alt={`Promotion ${index + 1}`} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
  
};

export default PromotionSection;
