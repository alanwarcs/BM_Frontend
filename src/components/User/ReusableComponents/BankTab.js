import React from 'react';
import TextInput from './TextInput'; // Assuming TextInput is in the same directory

const BankTab = ({ formData, handleChange }) => {
  return (
    <div className="block">
      {/* Account Holder Name */}
      <TextInput
        id="accountHolderName"
        label="Account Holder Name"
        placeholder="Enter account holder name"
        value={formData.accountHolderName}
        onChange={handleChange}
      />

      {/* Bank Name */}
      <TextInput
        id="bankName"
        label="Bank Name"
        placeholder="Enter bank name"
        value={formData.bankName}
        onChange={handleChange}
      />

      {/* Account Number */}
      <TextInput
        id="accountNumber"
        label="Account Number"
        placeholder="Enter account number"
        value={formData.accountNumber}
        onChange={handleChange}
      />

      {/* IFSC Code */}
      <TextInput
        id="ifscCode"
        label="IFSC Code"
        placeholder="Enter IFSC code"
        value={formData.ifscCode}
        onChange={handleChange}
      />
    </div>
  );
};

export default BankTab;
