import React from 'react';
import styles from './Step5_Confirmation.module.scss';
import { useRouter } from 'next/router';

const Step5_Confirmation = ({ selectedDate, customerData }) => {
  const router = useRouter(); // initialize router

  const navigateHome = () => {
    router.push('/'); // navigate to homepage
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.head}>Appointment confirmed:</h2>
      <p className={styles.paras}>Hello {customerData.firstName},</p>
      <p className={styles.paras}>
        Appointment has been confirmed for {selectedDate.toLocaleDateString()}.
        A confirmation email has been sent to {customerData.email}.
      </p>
      <p className={styles.paras}>
        Please contact us at knomorejunk.junkremoval@gmail.com if you have any questions regarding your appointment! Feel free to exit this page any time.
      </p>
      <div className={styles.buttonContainer}>
        <button className={styles.nextButton} onClick={navigateHome}>Go Home</button>
      </div>
    </div>
  );
};

export default Step5_Confirmation;
