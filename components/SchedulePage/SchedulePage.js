import React, { useState } from 'react';
import styles from './SchedulePage.module.scss';
import Step1_ServiceType from './Step1_ServiceType';
import Step2_Modifications from './Step2_Modifications';
import Step3_CustomerInfo from './Step3_CustomerInfo';
import Step4_DateSelection from './Step4_DateSelection';
import Step5_Confirmation from './Step5_Confirmation';

const SchedulePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [selectedModifications, setSelectedModifications] = useState([]);
  const [modificationData, setModificationData] = useState([]);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [serviceArray, setServiceArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const nextStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep((prevStep) => prevStep + 1);
  }
  
  const previousStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep((prevStep) => prevStep - 1);
  }
  

  switch(currentStep) {
    case 1:
      return (
        <Step1_ServiceType
          serviceType={serviceType}
          setServiceType={setServiceType}
          setPoints={setTotalPoints}
          setUnavailableDays={setUnavailableDays}
          onNext={nextStep}
          serviceArray={serviceArray}
          setServiceArray={setServiceArray}
        />
      );
    case 2:
      return (
        <Step2_Modifications
          serviceType={serviceType}
          selectedModifications={selectedModifications}
          setSelectedModifications={setSelectedModifications}
          setPoints={setTotalPoints}
          modificationData={modificationData}
          setModificationData={setModificationData}
          onNext={nextStep}
          onPrevious={previousStep}
        />
      );
    case 3:
      return (
        <Step3_CustomerInfo
          customerData={customerData}
          setCustomerData={setCustomerData}
          onNext={nextStep}
          onPrevious={previousStep}
        />
      );
      case 4:
        return (
          <Step4_DateSelection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            unavailableDays={unavailableDays}
            totalPoints={totalPoints}
            customerData={customerData} 
            serviceType={serviceType} 
            selectedModifications={selectedModifications} 
            modificationData={modificationData}
            serviceArray={serviceArray}
            totalPrice={setTotalPrice}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );      
    case 5:
      return (
        <Step5_Confirmation selectedDate={selectedDate} customerData={customerData} />
      );
    default:
      return null;
  }
};

export default SchedulePage;
