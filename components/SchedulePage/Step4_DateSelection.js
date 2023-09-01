import React, { useState, useEffect } from 'react';
import styles from './Step4_DateSelection.module.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Step4_DateSelection = ({ onNext, onPrevious, selectedDate, setSelectedDate, unavailableDays, customerData, modificationData, totalPoints, serviceArray }) => {
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Code to calculate totalPrice
  let servicePrice = serviceArray[0].price;
  let totalPrice = servicePrice; 
  for (let mod of modificationData) {
    if (mod.name == "Disassembly Required") {
        totalPrice += mod.price;
    } else {
      totalPrice += mod.price * mod.quantity;
    }
  }

  useEffect(() => {
    fetch('/api/scheduled-dates')
      .then((response) => response.json())
      .then((data) => {
        const dates = data.filter(item => item.points >= 6).map(item => new Date(item.date));
        setUnavailableDates(dates);
      })
      .catch((error) => console.error('Error:', error));
  },[]);

  const isDayUnavailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return (
      (unavailableDays ? unavailableDays.includes(date.getDay()) : false) ||
      (unavailableDates ? unavailableDates.some(unavailableDate => {
        try {
          return unavailableDate.toISOString().split('T')[0] === dateString;
        } catch (error) {
          console.error("Invalid date: ", unavailableDate);
        }
      }) : false)
    );
  };
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const pointsAsNumber = Number(totalPoints); // Convert points to number
      const dateAsString = selectedDate.toISOString().split('T')[0]; 

      // Existing logic: POST to /api/scheduled-dates
      const response1 = await fetch('/api/scheduled-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate, 
          points: pointsAsNumber, 
        }),
      });
      
      let servicePrice = serviceArray[0].price;
      let totalPrice = servicePrice; 
      for (let mod of modificationData) {
        if (mod.name == "Disassembly Required") {
            totalPrice += mod.price;
        } else {
          totalPrice += mod.price * mod.quantity;
        }
      }

      // New logic: POST to /api/appointments
      const response2 = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedDate: dateAsString,
          totalPoints: pointsAsNumber,
          customerData: customerData,
          serviceArray: serviceArray,
          modificationData: modificationData,
          totalPrice: totalPrice
        }),
      });

      //POST to /api/clients
      const response3 = await fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          customerData: customerData
       }),
      });

      if (response3.status === 409) {
        console.log('Client already exists');
      } else if (!response3.ok) {
        throw new Error(`HTTP error! status: ${response3.status}`);
      }

  
      // Ensure both requests were successful before moving to the next step.
      if (response1.ok && response2.ok) {
        // Make a request to the server to send the emails
        const emailData = {
          customerData: customerData,
          serviceArray: serviceArray,
          modificationData: modificationData,
          totalPrice: totalPrice,
          selectedDate: selectedDate.toISOString().split('T')[0]
        };
        const emailResponse = await fetch('/api/send-service-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
  
        if (emailResponse.ok) {
          console.log('Emails sent successfully');
          onNext();
        } else {
          throw new Error(`Error sending emails: ${emailResponse.status}`);
        }
      } else {
        throw new Error(`HTTP error! status: ${response1.status} or ${response2.status}`);
      }
    } catch (error) {
      console.log(error); // log the error, not response
    } finally {
      setIsLoading(false);
    }
  };

  const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <input 
      className={`${styles.dateInput} ${!value ? styles.placeholder : ''}`}
      onClick={onClick}
      ref={ref}
      placeholder={placeholder}
      value={value}
      readOnly 
    />
  ));

  CustomInput.displayName = 'CustomInput';
  
  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className="loading-screen">Do not close this page, please wait a moment...</div>
      ) : (
        <>
          {error && <p className={styles.error}>{error}</p>}
          <h2 className={styles.head}>Select Date</h2>
          <div className={styles.dateContainer}>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                filterDate={date => !isDayUnavailable(date)}
                className={styles.dateInput}
                minDate={minDate}
                placeholderText="Select a date"
                customInput={<CustomInput />}
              />
            </div>
          </div>
          <p>Your estimated total price: ${totalPrice.toFixed(2)}</p>  {/* Display totalPrice here. Note that toFixed(2) ensures the number is shown with two decimal places. */}
          <div className={styles.buttonContainer}>
            <button onClick={onPrevious} className={styles.nextButton}>&larr; Back</button> 
            <button onClick={handleSubmit} className={styles.nextButton}>Submit</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Step4_DateSelection;
