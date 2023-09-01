import React from 'react';
import styles from './Step3_CustomerInfo.module.scss';
import InputMask from 'react-input-mask';


const Step3_CustomerInfo = ({ onNext, onPrevious, customerData, setCustomerData }) => {

  const handleCustomerDataChange = (event) => {
    const { name, value } = event.target;
    setCustomerData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  const onNextValidated = () => {
    const allFieldsFilled = Object.values(customerData).every(field => field !== '');
  
    // Check if any customer data fields are empty
    if (!allFieldsFilled) {
      alert('All fields must be filled out.');
      return;
    }
  
    // Check for valid email
    const reEmail = /\S+@\S+\.\S+/;
    if (!reEmail.test(customerData.email)) {
      alert('Invalid email format');
      return;
    }
  
    // Check for valid name
    const reName = /^[a-zA-Z]+$/;
    if (!reName.test(customerData.firstName) || !reName.test(customerData.lastName)) {
      alert('Name should not contain numbers or special characters');
      return;
    }
  
    // Check for valid zip
    const reZip = /^\d{5}$/;
    if (!reZip.test(customerData.zip)) {
      alert('Invalid zip code');
      return;
    }

    const rePhone = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
    if (!rePhone.test(customerData.phone)) {
      alert('Invalid phone number, please enter 10 digits');
      return;
    }

    // If all fields are filled and valid, proceed to the next step
    onNext();
};


  return (
    <div className={styles.container}>
      <div className={styles.customerInfo}>
        <h2 className={styles.head}>Customer Information</h2>
        <div className={styles.formColumns}>
          <div className={styles.formColumn}>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={customerData.firstName || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={customerData.lastName || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
  <div className={styles.fieldContainer}>
    <label className={styles.label}>Phone:</label>
    <InputMask
      mask="(999) 999-9999"
      name="phone"
      value={customerData.phone || ''}
      className={styles.textInput}
      onChange={handleCustomerDataChange}
    />
  </div>
</div>
          </div>
          <div className={styles.formColumn}>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>Street Address:</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={customerData.streetAddress || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>City:</label>
                <input
                  type="text"
                  name="city"
                  value={customerData.city || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>State:</label>
                <input
                  type="text"
                  name="state"
                  value={customerData.state || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.fieldContainer}>
                <label className={styles.label}>ZIP:</label>
                <input
                  type="text"
                  name="zip"
                  value={customerData.zip || ''}
                  className={styles.textInput}
                  onChange={handleCustomerDataChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onPrevious} className={styles.nextButton}>&larr; Back</button> 
          <button onClick={onNextValidated} className={styles.nextButton}>Next &rarr;</button>
        </div>
      </div>
    </div>
  );
};

export default Step3_CustomerInfo;
