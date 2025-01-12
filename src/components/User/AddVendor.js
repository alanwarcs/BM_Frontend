import React, { useState } from 'react';
import UserLayout from './UserLayout'; // Import UserLayout for consistent page structure
import AddressTab from './ReusableComponents/AddressTab';
import TextInput from './ReusableComponents/TextInput';
import SelectInput from './ReusableComponents/SelectInput';
import TaxTab from './ReusableComponents/TaxTab';
import BankTab from './ReusableComponents/BankTab'

const AddVendor = () => {
    const [activeTab, setActiveTab] = useState("address"); // Initial tab is "address"
    const [formData, setFormData] = useState({
        vendorOrganizationName: '',
        primaryPerson: '',
        displayName: '',
        organizationName: '',

        emailAddress: '',
        phone: '',

        shippingAddress: 'IN',
        billingAddress: 'IN',

        taxStatus: '',
        sourceState: '',
        gstin: '',
        panNumber: '',

        currency: 'INR',
        tags: '',
        notes: '',

        bankDetails: [
            {
                accountHolderName: '',
                bankName: '',
                ifscCode: '',
                accountNumber: '',
            },
        ],
    });

    const MAX_BANKS = 4; // Maximum allowed banks
    const MAX_CUSTOM_FIELDS = 5; // Maximum allowed custom fields


    // State for custom fields
    const [customFields, setCustomFields] = useState([
        { key: '', value: '' },
    ]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const copyShippingToBilling = () => {
        setFormData((prev) => ({
            ...prev,
            billingAddress: prev.shippingAddress,
        }));
    };

    // Handle custom field
    const handleCustomFieldChange = (index, field, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index][field] = value;
        setCustomFields(updatedCustomFields);
    };

    // Add Custom Field with limit
    const addCustomField = () => {
        if (customFields.length < MAX_CUSTOM_FIELDS) {
            setCustomFields([...customFields, { key: '', value: '' }]);
        } else {
            alert(`You can only add up to ${MAX_CUSTOM_FIELDS} custom fields.`);
        }
    };

    // Remove a custom field
    const removeCustomField = (index) => {
        const updatedCustomFields = customFields.filter((_, i) => i !== index);
        setCustomFields(updatedCustomFields);
    };


    const handleBankChange = (index, field, value) => {
        const updatedBankDetails = [...formData.bankDetails];
        updatedBankDetails[index][field] = value;
        setFormData((prev) => ({ ...prev, bankDetails: updatedBankDetails }));
    };

    // Add Bank with limit
    const addBank = () => {
        if (formData.bankDetails.length < MAX_BANKS) {
            setFormData((prev) => ({
                ...prev,
                bankDetails: [
                    ...prev.bankDetails,
                    { accountHolderName: '', bankName: '', ifscCode: '', accountNumber: '' },
                ],
            }));
        } else {
            alert(`You can only add up to ${MAX_BANKS} bank details.`);
        }
    };

    const removeBank = (index) => {
        const updatedBankDetails = formData.bankDetails.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, bankDetails: updatedBankDetails }));
    };


    const displayNameOptions = [
        formData.primaryPerson && { value: formData.primaryPerson, label: formData.primaryPerson },
        formData.vendorOrganizationName && { value: formData.vendorOrganizationName, label: formData.vendorOrganizationName },
    ].filter(Boolean);  // Filter out undefined or null values


    return (
        <UserLayout>
            {/* Form Section */}
            <form className="flex flex-col relative h-full w-full text-start overflow-scroll">
                {/* Page Header */}
                <div className="text-2xl text-start font-semibold my-2">
                    <p>Add Vendor</p>
                </div>
                <hr />

                {/* Organization/Business Name */}
                <TextInput
                    label="Organization/Business Name"
                    id="vendorOrganizationName"
                    value={formData.vendorOrganizationName}
                    onChange={(e) => handleChange("vendorOrganizationName", e.target.value)}
                    placeholder="Enter organization/business name"
                />

                {/* Primary Person */}
                <TextInput
                    label="Primary Person"
                    id="primaryPerson"
                    value={formData.primaryPerson}
                    onChange={(e) => handleChange("primaryPerson", e.target.value)}
                    placeholder="Enter primary person name"
                />
                {/* Display Name */}
                <SelectInput
                    id="displayName"
                    label="Display Name"
                    required
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    options={displayNameOptions}
                />

                {/* Contact Info Section */}
                <div className="block">
                    <div className="flex flex-wrap">
                        {/* Email Address */}
                        <TextInput
                            label="Email Address"
                            id="emailAddress"
                            value={formData.emailAddress}
                            onChange={(e) => handleChange("emailAddress", e.target.value)}
                            placeholder="Enter email address"
                            type="email"
                        />
                        {/* Phone */}
                        <TextInput
                            label="Phone"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="Enter phone number"
                            type="text"
                        />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 border-b">
                    <button
                        type="button"
                        className={`py-2 px-4 ${activeTab === "address" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                        onClick={() => setActiveTab("address")}
                    >
                        Address
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 ${activeTab === "tax" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                        onClick={() => setActiveTab("tax")}
                    >
                        Tax/GST
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 ${activeTab === "bank" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                        onClick={() => setActiveTab("bank")}
                    >
                        Bank
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 ${activeTab === "other" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                        onClick={() => setActiveTab("other")}
                    >
                        Other
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 ${activeTab === "customFields" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                        onClick={() => setActiveTab("customFields")}
                    >
                        Custom Fields
                    </button>
                </div>

                {activeTab === "address" && (
                    <div className="block">
                        <AddressTab formData={formData} handleChange={handleChange} copyShippingToBilling={copyShippingToBilling} />
                    </div>
                )}

                {activeTab === "tax" && (
                    <TaxTab formData={formData} handleChange={handleChange} />
                )}

                {activeTab === "bank" && (
                    <div>
                        {formData.bankDetails.map((bank, index) => (
                            <div key={index} className="mb-4">
                                <BankTab
                                    formData={bank}
                                    handleChange={(field, value) => handleBankChange(index, field, value)}
                                />
                                <button
                                    type="button"
                                    className="text-red-500 text-sm"
                                    onClick={() => removeBank(index)}
                                >
                                    Remove Bank
                                </button>
                            </div>
                        ))}
                        {formData.bankDetails.length < MAX_BANKS && (
                            <button
                                type="button"
                                className="text-customPrimary text-sm"
                                onClick={addBank}
                            >
                                Add Another Bank
                            </button>
                        )}

                    </div>
                )}

                {activeTab === "other" && (
                    <div className="block">
                        <div className='flex flex-wrap'>

                            {/* Currency */}
                            <SelectInput
                                id="currency"
                                label="Currency"
                                value={formData.currency}
                                onChange={(e) => handleChange("currency", e.target.value)}
                                options={[
                                    { value: 'INR', label: 'INR' },
                                ]}
                            />

                            {/* Tags */}
                            <TextInput
                                label="Tags"
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => handleChange("tags", e.target.value)}
                                placeholder="Enter Tags (separate by comma)"
                                type="text"
                            />

                            {/* Notes */}
                            <div className="flex flex-col m-2">
                                <label htmlFor="notes" className="block text-gray-700 text-sm mb-2">
                                    Notes:
                                </label>
                                <textarea
                                    id="notes"
                                    className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                    rows="4"
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    placeholder="Enter any additional notes or information"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "customFields" && (
                    <div>
                        {customFields.map((field, index) => (
                            <div key={index} className="p-4 mb-2">
                                <TextInput
                                    label="Field Name"
                                    value={field.key}
                                    onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                />
                                <TextInput
                                    label="Value"
                                    value={field.value}
                                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCustomField(index)}
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        {customFields.length < MAX_CUSTOM_FIELDS && (
                            <button
                                type="button"
                                onClick={addCustomField}
                                className="text-customPrimary text-sm"
                            >
                                Add Custom Field
                            </button>
                        )}
                    </div>
                )}

                <div className='w-full bottom-0 bg-white'>
                    <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]">
                        Submit
                    </button>
                </div>
            </form>
        </UserLayout>
    );
};

export default AddVendor;