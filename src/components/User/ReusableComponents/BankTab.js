import React from "react";
import TextInput from "./TextInput"; // Assuming TextInput is in the same directory

const BankTab = ({ formData, handleChange }) => {
  if (!formData) {
    return <p>Loading...</p>; // Ensure formData exists
  }

  return (
    <div className="block">
      {/* Account Holder Name */}
      <TextInput
        id="accountHolderName"
        label="Account Holder Name"
        placeholder="Enter account holder name"
        value={formData.accountHolderName || ''}
        onChange={(e) => handleChange("accountHolderName", e.target.value)}
      />

      {/* Bank Name */}
      <TextInput
        id="bankName"
        label="Bank Name"
        placeholder="Enter bank name"
        value={formData.bankName || ''}
        onChange={(e) => handleChange("bankName", e.target.value)}
      />

      {/* Account Number */}
      <TextInput
        id="accountNumber"
        label="Account Number"
        placeholder="Enter account number"
        value={formData.accountNumber || ''}
        onChange={(e) => handleChange("accountNumber", e.target.value)}
      />

      {/* IFSC Code */}
      <TextInput
        id="ifscCode"
        label="IFSC Code"
        placeholder="Enter IFSC code"
        value={formData.ifscCode || ''}
        onChange={(e) => handleChange("ifscCode", e.target.value)}
      />
    </div>
  );
};

export default BankTab;