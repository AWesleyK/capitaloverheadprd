import React, { useState } from 'react';
import styles from './MaintenancePlan.module.scss';
import Link from 'next/link';
import { FaTools, FaCalendarCheck, FaPercentage, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const MaintenancePlan = () => {
  const [step, setStep] = useState(0); // 0: Intro, 1: Form, 2: Success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    plan: 'annual',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (plan) => {
    setFormData(prev => ({ ...prev, plan }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setStep(2);
    // In a real application, you would send this to an API
  };

  const renderIntro = () => (
    <div className={styles.introContainer}>
      <h2 className={styles.heading}>Maximize Your Door's Lifespan</h2>
      <p className={styles.subHeading}>
        Our professional maintenance plans ensure your garage door operates smoothly and safely all year round.
      </p>

      <div className={styles.benefitsGrid}>
        <div className={styles.benefitCard}>
          <div className={styles.iconWrapper}><FaTools /></div>
          <h4 className={styles.benefitTitle}>Expert Tune-ups</h4>
          <p className={styles.benefitText}>Two full tune-ups per year to keep everything running perfectly.</p>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.iconWrapper}><FaShieldAlt /></div>
          <h4 className={styles.benefitTitle}>Safety First</h4>
          <p className={styles.benefitText}>Comprehensive 20-point safety inspection with every visit.</p>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.iconWrapper}><FaCalendarCheck /></div>
          <h4 className={styles.benefitTitle}>Priority Service</h4>
          <p className={styles.benefitText}>Skip the line! Priority scheduling for all your repair needs.</p>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.iconWrapper}><FaPercentage /></div>
          <h4 className={styles.benefitTitle}>Exclusive Savings</h4>
          <p className={styles.benefitText}>Save 10-15% on all repair services and replacement parts.</p>
        </div>
      </div>

      <div className={styles.ctaWrapper}>
        <p className={styles.ctaText}>
          Don't wait for a breakdown. Enroll today and save capital on future repairs!
        </p>
        <button className={styles.submitButton} onClick={() => setStep(1)}>
          Get Started <FaArrowRight className={styles.inlineIcon} />
        </button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className={styles.formContainer}>
      <button className={styles.backLink} onClick={() => setStep(0)}>
        &larr; Back to Information
      </button>
      <h2 className={styles.heading}>Enrollment Form</h2>
      <p className={styles.subHeading}>
        Please provide your details below to start your maintenance plan.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Contact Information</h3>
          <div className={styles.inputGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
          </div>
          <div className={styles.inputGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Service Address</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Street Address</label>
            <input 
              type="text" 
              name="street" 
              value={formData.street} 
              onChange={handleChange} 
              className={styles.input} 
              required 
            />
          </div>
          <div className={styles.inputGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ZIP Code</label>
              <input 
                type="text" 
                name="zip" 
                value={formData.zip} 
                onChange={handleChange} 
                className={styles.input} 
                required 
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Select Your Plan</h3>
          <div className={styles.planSelection}>
            <div 
              className={`${styles.planCard} ${formData.plan === 'monthly' ? styles.active : ''}`}
              onClick={() => handlePlanSelect('monthly')}
            >
              <h4 className={styles.planTitle}>Monthly Plan</h4>
              <p className={styles.planPrice}>$19.99 / mo</p>
              <p className={styles.planDetails}>
                Basic inspections and lubrication. 10% discount on all repairs.
              </p>
            </div>
            <div 
              className={`${styles.planCard} ${formData.plan === 'annual' ? styles.active : ''}`}
              onClick={() => handlePlanSelect('annual')}
            >
              <h4 className={styles.planTitle}>Annual Plan</h4>
              <p className={styles.planPrice}>$199 / yr</p>
              <p className={styles.planDetails}>
                Two full tune-ups per year. Priority scheduling. 15% discount on all repairs and parts.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Additional Notes</h3>
          <div className={styles.formGroup}>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Tell us about your garage door or any specific concerns..." 
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.squarePlaceholder}>
          <p className={styles.squareText}>
            Payment will be securely processed through Square in the next step.
          </p>
        </div>

        <button type="submit" className={styles.submitButton}>
          Continue to Payment
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <>
      <h2 className={styles.heading}>Thank You!</h2>
      <p className={styles.subHeading}>
        Your enrollment request has been received. We will contact you shortly to finalize your maintenance plan.
      </p>
      <div className={styles.buttonGroup}>
        <button 
          className={styles.submitButton} 
          onClick={() => setStep(1)}
        >
          Back to Form
        </button>
        <Link href="/" className={styles.secondaryButton}>
          Back to Home
        </Link>
      </div>
    </>
  );

  return (
    <section className={styles.maintenancePlanSection}>
      <div className={styles.container}>
        {step === 0 && renderIntro()}
        {step === 1 && renderForm()}
        {step === 2 && renderSuccess()}
      </div>
    </section>
  );
};

export default MaintenancePlan;
