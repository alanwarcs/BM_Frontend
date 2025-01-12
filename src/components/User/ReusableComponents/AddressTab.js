import React, { useState, useEffect } from 'react';
import { State } from 'country-state-city';
import TextInput from './TextInput';
import SelectInput from './SelectInput';

const AddressTab = ({ formData, handleChange, copyShippingToBilling }) => {
  const [countries] = useState([{ isoCode: 'IN', name: 'India' }]); // Only India
  const [shippingStates, setShippingStates] = useState([]);
  const [billingStates, setBillingStates] = useState([]);

  useEffect(() => {
    // Set the country to "India" if not already set
    if (!formData.shippingCountry) handleChange({ target: { id: 'shippingCountry', value: 'IN' } });
    if (!formData.billingCountry) handleChange({ target: { id: 'billingCountry', value: 'IN' } });

    // Set all states of India for both shipping and billing
    const allStates = State.getStatesOfCountry('IN');
    setShippingStates(allStates);
    setBillingStates(allStates);
  }, [formData.shippingCountry, formData.billingCountry, handleChange]);

  useEffect(() => {
    // If no valid state is found, clear the shippingState
    if (formData.shippingCountry === 'IN' && formData.shippingState) {
      const states = State.getStatesOfCountry('IN');
      if (!states.some(state => state.isoCode === formData.shippingState)) {
        handleChange({ target: { id: 'shippingState', value: '' } });
      }
    }
  }, [formData.shippingCountry, formData.shippingState, handleChange]);

  useEffect(() => {
    // If no valid state is found, clear the billingState
    if (formData.billingCountry === 'IN' && formData.billingState) {
      const states = State.getStatesOfCountry('IN');
      if (!states.some(state => state.isoCode === formData.billingState)) {
        handleChange({ target: { id: 'billingState', value: '' } });
      }
    }
  }, [formData.billingCountry, formData.billingState, handleChange]);

  return (
    <div className="flex flex-wrap">
      {/* Shipping Address */}
      <div className="flex flex-col m-2">
        <p className="my-2 font-semibold">Shipping Address</p>

        {/* Country - Disabled */}
        <SelectInput
          id="shippingCountry"
          label="Country"
          required
          value={formData.shippingCountry}
          onChange={handleChange}
          options={countries.map(country => ({
            value: country.isoCode,
            label: country.name,
          }))}
          disabled
        />

        {/* Address Line 1 */}
        <TextInput
          id="shippingAddress1"
          label="Address Line 1"
          required
          placeholder="Enter address line 1"
          value={formData.shippingAddress1}
          onChange={handleChange}
        />

        {/* City */}
        <TextInput
          id="shippingCity"
          label="City"
          required
          placeholder="Enter city"
          value={formData.shippingCity}
          onChange={handleChange}
        />

        {/* State */}
        <SelectInput
          id="shippingState"
          label="State"
          required
          value={formData.shippingState}
          onChange={handleChange}
          options={shippingStates.map(state => ({
            value: state.isoCode,
            label: state.name,
          }))}
        />

        {/* Pincode */}
        <TextInput
          id="shippingPincode"
          label="Pincode"
          required
          placeholder="Enter pincode"
          value={formData.shippingPincode}
          onChange={handleChange}
        />
      </div>

      {/* Billing Address */}
      <div className="flex flex-col m-2">
        <div className="flex items-center">
          <p className="my-2 me-2 font-semibold">Billing Address</p>
          <button type="button" onClick={copyShippingToBilling} className="text-customPrimary text-sm">
            Copy Shipping Address
          </button>
        </div>

        {/* Country - Disabled */}
        <SelectInput
          id="billingCountry"
          label="Country"
          required
          value={formData.billingCountry}
          onChange={handleChange}
          options={countries.map(country => ({
            value: country.isoCode,
            label: country.name,
          }))}
          disabled
        />

        {/* Address Line 1 */}
        <TextInput
          id="billingAddress1"
          label="Address Line 1"
          required
          placeholder="Enter address line 1"
          value={formData.billingAddress1}
          onChange={handleChange}
        />

        {/* City */}
        <TextInput
          id="billingCity"
          label="City"
          required
          placeholder="Enter city"
          value={formData.billingCity}
          onChange={handleChange}
        />

        {/* State */}
        <SelectInput
          id="billingState"
          label="State"
          required
          value={formData.billingState}
          onChange={handleChange}
          options={billingStates.map(state => ({
            value: state.isoCode,
            label: state.name,
          }))}
        />

        {/* Pincode */}
        <TextInput
          id="billingPincode"
          label="Pincode"
          required
          placeholder="Enter pincode"
          value={formData.billingPincode}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default AddressTab;