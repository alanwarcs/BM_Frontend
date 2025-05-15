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
    if (!formData.shippingAddress.country) handleChange({ target: { name: 'shippingCountry', value: 'IN' } });
    if (!formData.billingAddress.country) handleChange({ target: { name: 'billingCountry', value: 'IN' } });

    // Set all states of India for both shipping and billing
    const allStates = State.getStatesOfCountry('IN');
    setShippingStates(allStates);
    setBillingStates(allStates);
  }, [formData.shippingAddress.country, formData.billingAddress.country, handleChange]);

  useEffect(() => {
    // If no valid state is found, clear the shippingState
    if (formData.shippingAddress.country === 'IN' && formData.shippingAddress.state) {
      const states = State.getStatesOfCountry('IN');
      if (!states.some(state => state.isoCode === formData.shippingAddress.state)) {
        handleChange({ target: { name: 'shippingState', value: '' } });
      }
    }
  }, [formData.shippingAddress.country, formData.shippingAddress.state, handleChange]);

  useEffect(() => {
    // If no valid state is found, clear the billingState
    if (formData.billingAddress.country === 'IN' && formData.billingAddress.state) {
      const states = State.getStatesOfCountry('IN');
      if (!states.some(state => state.isoCode === formData.billingAddress.state)) {
        handleChange({ target: { name: 'billingState', value: '' } });
      }
    }
  }, [formData.billingAddress.country, formData.billingAddress.state, handleChange]);

  return (
    <div className="flex flex-wrap">
      {/* Shipping Address */}
      <div className="flex flex-col m-2">
        <p className="my-2 font-semibold">Shipping Address</p>

        {/* Country - Disabled */}
        <SelectInput
          name="shippingCountry" // Add the name attribute here
          label="Country"
          required
          value={formData.shippingAddress.country}
          onChange={(e) => handleChange('shippingAddress.country', e.target.value)} // Pass explicitly
          options={countries.map(country => ({
            value: country.isoCode,
            label: country.name,
          }))}
          disabled
        />

        {/* Address Line 1 */}
        <TextInput
          name="shippingAddress1" // Add the name attribute here
          label="Address Line 1"
          required
          placeholder="Enter address line 1"
          value={formData.shippingAddress.addressLine1}
          onChange={(e) => handleChange('shippingAddress.addressLine1', e.target.value)} // Pass explicitly
        />

        {/* City */}
        <TextInput
          name="shippingCity" // Add the name attribute here
          label="City"
          required
          placeholder="Enter city"
          value={formData.shippingAddress.city}
          onChange={(e) => handleChange('shippingAddress.city', e.target.value)} // Pass explicitly
        />

        {/* State */}
        <SelectInput
          name="shippingState" // Add the name attribute here
          label="State"
          required
          value={formData.shippingAddress.state}
          onChange={(e) => handleChange('shippingAddress.state', e.target.value)} // Pass explicitly
          options={shippingStates.map(state => ({
            value: state.name,
            label: state.name,
          }))}
        />

        {/* Pincode */}
        <TextInput
          name="shippingPincode" // Add the name attribute here
          label="Pincode"
          required
          placeholder="Enter pincode"
          value={formData.shippingAddress.postalCode}
          onChange={(e) => handleChange('shippingAddress.postalCode', e.target.value)} // Pass explicitly
        />
      </div>

      {/* Billing Address */}
      <div className="flex flex-col m-2">
        <div className="flex items-center">
          <p className="my-2 me-2 font-semibold">Billing Address</p>
          <button type="button" onClick={copyShippingToBilling} className="text-customPrimary text-start text-sm">
            Copy Shipping Address
          </button>
        </div>

        {/* Country - Disabled */}
        <SelectInput
          name="billingCountry" // Add the name attribute here
          label="Country"
          required
          value={formData.billingAddress.country}
          onChange={(e) => handleChange('billingAddress.country', e.target.value)} // Pass explicitly
          options={countries.map(country => ({
            value: country.isoCode,
            label: country.name,
          }))}
          disabled
        />

        {/* Address Line 1 */}
        <TextInput
          name="billingAddress1" // Add the name attribute here
          label="Address Line 1"
          required
          placeholder="Enter address line 1"
          value={formData.billingAddress.addressLine1}
          onChange={(e) => handleChange('billingAddress.addressLine1', e.target.value)} // Pass explicitly
        />

        {/* City */}
        <TextInput
          name="billingCity" // Add the name attribute here
          label="City"
          required
          placeholder="Enter city"
          value={formData.billingAddress.city}
          onChange={(e) => handleChange('billingAddress.city', e.target.value)} // Pass explicitly
        />

        {/* State */}
        <SelectInput
          name="billingState" // Add the name attribute here
          label="State"
          required
          value={formData.billingAddress.state}
          onChange={(e) => handleChange('billingAddress.state', e.target.value)} // Pass explicitly
          options={billingStates.map(state => ({
            value: state.isoCode,
            label: state.name,
          }))}
        />

        {/* Pincode */}
        <TextInput
          name="billingPincode" // Add the name attribute here
          label="Pincode"
          required
          placeholder="Enter pincode"
          value={formData.billingAddress.postalCode}
          onChange={(e) => handleChange('billingAddress.postalCode', e.target.value)} // Pass explicitly
        />
      </div>
    </div>
  );
};

export default AddressTab;
