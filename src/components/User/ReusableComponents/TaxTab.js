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
        label="Tax Status"
        value={formData.taxStatus}
        onChange={(e) => handleChange('taxStatus', e.target.value)}  // Ensure the correct field name is used
        options={[
          { value: 'gstRegistered', label: 'GST Registered' },
          { value: 'unregistered', label: 'Unregistered' },
        ]}
        required
      />

      {/* Source State */}
      <SelectInput
        id="sourceState"
        label="Source State"
        value={formData.sourceState}
        onChange={(e) => handleChange('sourceState', e.target.value)}  // Ensure the correct field name is used
        options={states.map(state => ({
          value: state.isoCode,
          label: state.name,
        }))}
      />

      {/* GST Number */}
      <TextInput
        label="GSTIN"
        id="gstin"
        value={formData.gstin}
        onChange={(e) => handleChange("gstin", e.target.value)}
        placeholder="Enter GST Number"
      />

      {/* PAN Number */}
      <TextInput
        label="PAN"
        id="panNumber"
        value={formData.panNumber}
        onChange={(e) => handleChange("panNumber", e.target.value)}
        placeholder="Enter PAN Number"
      />
    </div>
  );
};

export default TaxTab;
