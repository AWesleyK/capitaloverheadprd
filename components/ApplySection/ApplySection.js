import React, { useState } from 'react';
import styles from './ApplySection.module.scss';

const ApplySection = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isAgeChecked, setIsAgeChecked] = useState(false);
  const [experiences, setExperiences] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    const data = {
      firstName,
      lastName,
      email,
      isAgeChecked,
      experiences,
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.error('Error sending email:', response.status);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleExperiencesChange = (event) => {
    setExperiences(event.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <section className={styles.applySection}>
      <h2 className={styles.applyHeading}>Apply</h2>
      <div className={styles.applyParaContainer}>
        <h3 className={styles.applyPara}>
          Looking for some extra work? <br />
          We&apos;re always looking for help and can be flexible on hours! <br />
          Feel free to drop a resume and email address below, and we will get back to you.
        </h3>
      </div>
      <form onSubmit={handleSubmit} className={styles.applyForm}>
        <div className={styles.nameInputGroup}>
          <div className={styles.namePair}>
            <label htmlFor="firstName" className={styles.nameLabel}>
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={styles.fNameInput}
            />
          </div>
          <div className={styles.namePair}>
            <label htmlFor="lastName" className={styles.nameLabel}>
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={styles.lNameInput}
            />
          </div>
          <div className={styles.namePair}>
            <label htmlFor="email" className={styles.nameLabel}>
              Email:
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${styles.emailInput} ${isEmailValid ? '' : styles.invalid}`}
            />
            {!isEmailValid && (
              <p className={styles.errorMsg}>Please enter a valid email address.</p>
            )}
          </div>
        </div>

        <div className={styles.ageCheck}>
          <input
            type="checkbox"
            id="ageCheck"
            checked={isAgeChecked}
            onChange={(event) => setIsAgeChecked(event.target.checked)}
          />
          <label htmlFor="ageCheck" className={styles.ageCheckLabel}>
            Are you 18 years of age or older?
          </label>
        </div>

        <div className={styles.experiencesGroup}>
          <label htmlFor="experiences" className={styles.experiencesLabel}>
            Past Experiences:
          </label>
          <textarea
            id="experiences"
            value={experiences}
            onChange={handleExperiencesChange}
            placeholder="Please list any past jobs you might've held, years worked, and the things you did in these jobs."
            className={styles.experiencesTextarea}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </section>
  );
};

export default ApplySection;
