import React, { useState, useEffect } from 'react';
import styles from './ContactSection.module.scss';
import Image from 'next/image';

const ContactSection = () => {
  const phoneNumber = '4054560399'; // Replace with your phone number
  const [isMobile, setIsMobile] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    // Event listener for screen resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLaptop(window.innerWidth > 768 && window.innerWidth <= 1300);
    };

    // Set the initial value
    handleResize();

    // Subscribe to resize events
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

// Define the image dimensions based on the device type
let imageWidth, imageHeight;
if (isMobile) {
  imageWidth = 200;
  imageHeight = 200;
} else if (isLaptop) {
  // Define the dimensions you want for laptop-sized screens
  imageWidth = 200; // Example width for laptops
  imageHeight = 200; // Example height for laptops
} else {
  // Default to desktop dimensions
  imageWidth = 300;
  imageHeight = 300;
}

  return (
    <section className={styles.contactSection}>
      <div className={styles.content}>
        {!isMobile && (
          <div className={styles.imageContainerLeft}>
            {/* Add your second image here, adjust width and height as needed */}
            <Image
              src="/images/BlackRaisedPanel.jpg" 
              alt="Second Image"
              width={imageWidth} // Adjust as needed
              height={imageHeight} // Adjust as needed
              className={styles.image}
            />
          </div>
        )}
        <div className={styles.taglineContainer}>
          <p className={styles.catchphrase}>
            Trust our team to fix your garage door needs! Save capital with our cost
            effective, budget friendly options for garage door repairs! We service
            Liftmaster MyQ, Genie, Linear and many more garage door openers near you!
          </p>
          {isMobile && (
            <div className={styles.imageContainer}>
              <Image
                src="/images/LiftMasterGarageDoorOpener.jpeg"
                alt="Main Image"
                width={imageWidth}
                height={imageHeight}
                className={styles.image}
              />
            </div>
          )}
          <a className={styles.callButton} href={`tel:${phoneNumber}`}>
            Consult With Us
          </a>
        </div>
        {!isMobile && (
          <div className={styles.imageContainer}>
            <Image
              src="/images/LiftMasterGarageDoorOpener.jpeg"
              alt="Main Image"
              width={imageWidth}
              height={imageHeight}
              className={styles.image}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
