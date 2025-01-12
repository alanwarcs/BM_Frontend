import React, { useState, useEffect } from 'react';
import { State } from 'country-state-city';
import SelectInput from './SelectInput';
import TextInput from './TextInput';

const TaxTab = ({ formData, handleChange }) => {
  const [states, setStates] = useState([]);

  useEffect(() => {
    // Fetch all states of India when the component mounts
    const allStates = State.getStatesOfCountry('IN');
    setStates(allStates);
  }, []);

  return (
    <div className="block">
      {/* Tax Status */}
      <SelectInput
        id="taxStatus"
        name="taxDetails.taxStatus" // Add name attribute
        label="Tax Status"
        value={formData.taxDetails.taxStatus}
        onChange={(e) => handleChange('taxDetails.taxStatus', e.target.value)} // Pass explicitly
        options={[
          { value: 'gstRegistered', label: 'GST Registered' },
          { value: 'unregistered', label: 'Unregistered' },
        ]}
        required
      />

      {/* Source State */}
      <SelectInput
        id="sourceState"
        name="taxDetails.sourceState" // Add name attribute
        label="Source State"
        value={formData.taxDetails.sourceState}
        onChange={(e) => handleChange('taxDetails.sourceState', e.target.value)} // Pass explicitly
        options={states.map(state => ({
          value: state.isoCode,
          label: state.name,
        }))}
      />

      {/* GST Number */}
      <TextInput
        label="GSTIN"
        id="gstin"
        name="taxDetails.gstin" // Add name attribute
        value={formData.taxDetails.gstin}
        onChange={(e) => handleChange('taxDetails.gstin', e.target.value)} // Pass explicitly
        placeholder="Enter GST Number"
      />

      {/* PAN Number */}
      <TextInput
        label="PAN"
        id="panNumber"
        name="taxDetails.panNumber" // Add name attribute
        value={formData.taxDetails.panNumber}
        onChange={(e) => handleChange('taxDetails.panNumber', e.target.value)} // Pass explicitly
        placeholder="Enter PAN Number"
      />

    </div>
  );
};

export default TaxTab;
