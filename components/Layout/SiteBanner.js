// components/Layout/SiteBanner.js
import { useEffect, useState } from 'react';
import styles from './Layout.module.scss';

const SiteBanner = () => {
  const [banner, setBanner] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch('/api/content/announcement/public');
        const data = await res.json();

        const storedVersion = localStorage.getItem("bannerDismissedVersion");

        if (res.ok && data.banner) {
          const currentVersion = data.banner.version || "1.0";

          if (storedVersion !== currentVersion) {
            setBanner(data.banner);
            setVisible(true);

            // Wait for banner to appear then roll up door
            setTimeout(() => {
              const door = document.querySelector(`.${styles.door}`);
              if (door) door.classList.add(styles.open);
            }, 300); // slight delay for entrance effect
          }
        }
      } catch (err) {
        console.error('Failed to fetch banner:', err);
      }
    };

    fetchBanner();
  }, []);

  const handleDismiss = () => {
    const door = document.querySelector(`.${styles.door}`);
    const wrapper = document.querySelector(`.${styles.houseWrapper}`);

    if (door && wrapper) {
      door.classList.remove(styles.open);
      door.classList.add(styles.close);

      setTimeout(() => {
        wrapper.classList.add(styles['pop-out']);
      }, 800);

      setTimeout(() => {
        localStorage.setItem("bannerDismissedVersion", banner.version || "1.0");
        setVisible(false);
      }, 1300);
    }
  };

  if (!banner) return null;

  return (
    <div className={`${styles.siteBannerWrapper} ${visible ? styles.open : ''}`}>
      {visible && (
        <div className={styles.houseWrapper}>
          <div className={styles.roof} />
          <div className={styles.house}>
            <div className={styles.door}  />
            <div
  className={styles.messageInside}
  style={{
    backgroundColor: banner.backgroundColor,
    color: banner.textColor,
  }}
>
              {banner.message}
              <button className={styles.closeButton} onClick={handleDismiss}>
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteBanner;
