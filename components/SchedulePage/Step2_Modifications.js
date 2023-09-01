import React, { useEffect, useState } from 'react';
import styles from './Step2_Modifications.module.scss';

const Step2_Modifications = ({
  onNext, 
  onPrevious, 
  selectedModifications, 
  setSelectedModifications, 
  serviceType, 
  setPoints,
  modificationData, // passed from parent
  setModificationData, // passed from parent
}) => {
  const [modifications, setModifications] = useState([]);
  const [type3Amounts, setType3Amounts] = useState({});
  const [type2Amounts, setType2Amounts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModifications = async () => {
      setLoading(true);
      setTimeout(async () => {
        try {
          const response = await fetch(`./api/modifiers?type=${serviceType}`);
          if (response.ok) {
            const fetchedModifications = await response.json();

            const groupedModifications = fetchedModifications.reduce((acc, modification) => {
              if (!acc[modification.type]) {
                acc[modification.type] = [];
              }
              acc[modification.type].push(modification);
              return acc;
            }, {});

            if (groupedModifications['3']) {
              groupedModifications['3'].sort((a, b) => a.orderNum - b.orderNum);
            }

            setModifications(groupedModifications);
          } else {
            console.error('Error fetching modifications:', response.status, await response.text());
          }
        } catch (error) {
          console.error('Error fetching modifications:', error);
        }
        setLoading(false);
      }, 2000); // delay duration
    };

    fetchModifications();
  }, [serviceType]);

  const handleModificationChange = async (type, id, checked) => {
    const selectedModification = modifications[type].find(mod => mod._id === id);
    if (type === '3' && checked && (!selectedModification.price || selectedModification.price === '')) {
      alert('Rates for this service addition vary. Please call to schedule');
      return;
    }
    
    // Clear the previously selected type 1 modification if a new one is selected
    if (type === '1') {
      setSelectedModifications(prevSelected => {
        const filtered = prevSelected.filter(modId => {
          const mod = modifications['1'].find(m => m._id === modId);
          return !mod;  // remove if it's a type 1 modification
        });
        return [...filtered, id];  // add the new type 1 modification
      });
    } else {
      setSelectedModifications(prevSelected => {
        if (checked) {
          return [...prevSelected, id];
        } else {
          return prevSelected.filter(modId => modId !== id);
        }
      });
    }

    if (checked) {
      const quantity = type3Amounts[id] || 1;
      const floor = type2Amounts[id] || '';
      setPoints(prevPoints => prevPoints + selectedModification.points * quantity);

    } else {
      const quantity = type3Amounts[id] || 1;
      setPoints(prevPoints => prevPoints - selectedModification.points * quantity);

      if (type === '3') {
        setType3Amounts((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    }
/*
    // For type 1, we update the modificationData right away
    if (type === '1') {
      await setModificationData(prevData => [
        // remove previous type 1 data
        ...prevData.filter(mod => {
          const isType1 = modifications['1'].find(m => m._id === mod.id);
          return !isType1;
        }),
        // add new type 1 data
        { id, name: selectedModification.name, price: selectedModification.price, quantity: 1, floor: '' }
      ]);
    }
    */
  };

  const handleType3AmountChange = (id, event) => {
    const value = parseInt(event.target.value) || 0;

    setType3Amounts((prev) => {
      const prevValue = prev[id] || 1;
      const selectedModification = modifications['3'].find(mod => mod._id === id);
      const pointDiff = (value - prevValue) * selectedModification.points;

      setPoints(prevPoints => prevPoints + pointDiff);
      return { ...prev, [id]: value };
    });
  };

  const handleType2AmountChange = (id, event) => {
    const value = event.target.value;
    setType2Amounts((prev) => {
      return { ...prev, [id]: value };
    });
  };    

  const onNextValidated = () => {
    // Go through each of the selected modifications
    for (let modId of selectedModifications) {
      const selectedMod = modifications['2']?.find(mod => mod._id === modId) || modifications['3']?.find(mod => mod._id === modId);
    
      // If a modification requires an amount and it's empty, don't proceed
      // Bypass the check for 'Disassembly Required'
      if (selectedMod && selectedMod.name !== "Disassembly Required" && 
      !(type3Amounts[modId] > 0 || type2Amounts[modId] > 0)) {
        alert("All textboxes must be filled with a number");
        return;
      }
    }
  
    // Build the new modification data
    const newModificationData = selectedModifications.map(modId => {
      const selectedMod = modifications['1']?.find(mod => mod._id === modId) || modifications['2']?.find(mod => mod._id === modId) || modifications['3']?.find(mod => mod._id === modId);
      console.log(`Processing modId: ${modId}`); // add this
      console.log(`Found modification: ${JSON.stringify(selectedMod)}`); // and this
      return {
        id: modId,
        name: selectedMod.name,
        price: selectedMod.price,
        quantity: type3Amounts[modId] || 1,
        floor: type2Amounts[modId] || '',
        type: selectedMod.type
      };
    });

    if (!selectedModifications.some(modId => modifications['1']?.some(mod => mod._id === modId))) {
      alert("You must select a building type before proceeding.");
      return;
    }
  
    console.log(newModificationData)
    // Update the modification data
    setModificationData(newModificationData);
  
    // If everything is okay, proceed to the next step
    onNext();
  };
  

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loader}></div>
      ) : (
        <div className={styles.container}>
          <div className={styles.modificationsContainer}>
            <h1 className={styles.title}>Select Details</h1>
            {modifications['1'] && (
              <div className={styles.modificationList}>
                <h3 className={styles.h3}>Building Type</h3>
                <select 
                  className={styles.selectDropdown} 
                  onChange={(e) => handleModificationChange('1', e.target.value, true)}
                  defaultValue="" // Set default value as empty string
                >
                <option disabled value="">
                  Please select a building type
                </option>

                {modifications['1'].map((modification) => (
                <option
                  key={modification._id}
                  value={modification._id}
                >
                  {modification.name}
                </option>
                ))}
                </select>
              </div>
            )}
  
      {/* Type 2 modifications */}
      {serviceType !== 'Trailer Rental' && modifications['2'] && (
        <div>
          <h3 className={styles.h3}>Service Additions</h3>
          <ul className={styles.modificationList}>
            {modifications['2'].map((modification) => (
              <li key={modification._id} className={styles.modificationItem}>
                <input
                  className={styles.checkboxInput}
                  type="checkbox"
                  id={modification._id}
                  checked={selectedModifications.includes(modification._id)}
                  onChange={(e) => handleModificationChange('2', modification._id, e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor={modification._id}>
                  {modification.name} (Additional Cost: ${modification.price})
                </label>
                {modification._id === '64c7061740e306bd8feabd7a' && selectedModifications.includes(modification._id) && (
                  <input
                    className={styles.textInput}
                    type="text"
                    value={type2Amounts[modification._id] || ''}
                    onChange={(e) => handleType2AmountChange(modification._id, e)}
                    placeholder="Which floor?"
                    required
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Type 3 modifications */}
      {modifications['3'] && (
        <div>
          <h3 className={styles.h3}>Specific Unit Details</h3>
          <ul className={styles.modificationList}>
            {modifications['3'].map((modification) => (
              <li key={modification._id} className={styles.modificationItem}>
                <input
                  className={styles.checkboxInput}
                  type="checkbox"
                  id={modification._id}
                  checked={selectedModifications.includes(modification._id)}
                  onChange={(e) => handleModificationChange('3', modification._id, e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor={modification._id}>
                  {modification.name} (Additional Cost: ${modification.price})
                </label>
                {selectedModifications.includes(modification._id) && (
                  <input
                    className={styles.textInput}
                    type="text"
                    value={type3Amounts[modification._id] || ''}
                    onChange={(e) => handleType3AmountChange(modification._id, e)}
                    placeholder="Amount"
                    required
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
      <div className={styles.buttonContainer}>
      <button onClick={onPrevious} className={styles.nextButton}>&larr; Back</button> <button onClick={onNextValidated} className={styles.nextButton}>Next &rarr;</button>
      </div>
    </div>
    )}
    </div>
  );
};

export default Step2_Modifications;
