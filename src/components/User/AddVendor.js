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
        vendorOrganizationName: '', // Vendor's organization name
        primaryPerson: '', // Primary contact person
        displayName: '', // Display name for the vendor
        emailAddress: '', // Vendor's email address
        phone: '', // Vendor's phone number

        shippingAddress: {
            addressLine1: '', // First line of shipping address
            city: '', // Shipping city
            state: '', // Shipping state
            country: 'IN', // Default to India
            postalCode: '', // Shipping postal code
        },

        billingAddress: {
            addressLine1: '', // First line of billing address
            city: '', // Billing city
            state: '', // Billing state
            country: 'IN', // Default to India
            postalCode: '', // Billing postal code
        },

        taxDetails: {
            taxStatus: '', // Tax status (e.g., GST Registered, Unregistered)
            sourceState: '', // Source state
            gstin: '', // GSTIN if GST Registered
            panNumber: '', // PAN number
        },

        currency: 'INR', // Default currency
        tags: '', // Tags for categorizing the vendor
        notes: '', // Additional notes about the vendor

        bankDetails: [
            {
                accountHolderName: '',
                bankName: '',
                ifscCode: '',
                accountNumber: '',
            },
        ],

        customFields: [
            {
                fieldName: '', // Custom field name
                fieldValue: '', // Custom field value
            },
        ],
    });

    const MAX_BANKS = 4; // Maximum allowed banks
    const MAX_CUSTOM_FIELDS = 5; // Maximum allowed custom fields

    // State for custom fields
    const [customFields, setCustomFields] = useState([
        { key: '', value: '' },
    ]);

    const handleChange = (nameOrEvent, value) => {
        if (typeof nameOrEvent === "string") {
            // Handle nested fields like "taxDetails.gstin"
            if (nameOrEvent.includes('.')) {
                const keys = nameOrEvent.split('.');
                setFormData((prevData) => {
                    const updatedData = { ...prevData };
                    let nested = updatedData;
                    for (let i = 0; i < keys.length - 1; i++) {
                        nested = nested[keys[i]]; // Navigate to the nested object
                    }
                    nested[keys[keys.length - 1]] = value; // Update the nested key
                    return updatedData;
                });
            } else {
                // Handle top-level fields
                setFormData((prevData) => ({
                    ...prevData,
                    [nameOrEvent]: value,
                }));
            }
        } else {
            // Handle event directly
            const { name, value: eventValue } = nameOrEvent.target;
            if (!name) {
                console.error("Field name is missing in the event target", nameOrEvent);
                return;
            }
            handleChange(name, eventValue); // Delegate to the string-based handler
        }
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
        setFormData((prev) => {
            const updatedBankDetails = [...prev.bankDetails];
            updatedBankDetails[index] = {
                ...updatedBankDetails[index],
                [field]: value,
            };
            return { ...prev, bankDetails: updatedBankDetails };
        });
    };

    const addBank = () => {
        if (formData.bankDetails.length < MAX_BANKS) {
            setFormData((prev) => ({
                ...prev,
                bankDetails: [
                    ...prev.bankDetails,
                    { accountHolderName: "", bankName: "", ifscCode: "", accountNumber: "" },
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

    // Form validation
    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

        // Validate Display Name
        if (!formData.displayName?.trim()) {
            alert("Display Name is required.");
            return false;
        }

        // Validate Email Address (if provided)
        if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
            alert("Please enter a valid email address.");
            return false;
        }

        // Validate Shipping Address
        const { shippingAddress, billingAddress, taxDetails } = formData;

        if (
            !shippingAddress?.addressLine1?.trim() ||
            !shippingAddress?.city?.trim() ||
            !shippingAddress?.state?.trim() ||
            !shippingAddress?.country?.trim()
        ) {
            alert("Please enter a valid Shipping Address.");
            return false;
        }

        // Validate Shipping Address Pincode
        if (!/^\d+$/.test(shippingAddress?.postalCode?.trim())) {
            alert("Shipping Address Pincode must be a valid number.");
            return false;
        }

        // Validate Billing Address
        if (
            !billingAddress?.addressLine1?.trim() ||
            !billingAddress?.city?.trim() ||
            !billingAddress?.state?.trim() ||
            !billingAddress?.country?.trim()
        ) {
            alert("Please enter a valid Billing Address.");
            return false;
        }

        // Validate Billing Address Pincode
        if (!/^\d+$/.test(billingAddress?.postalCode?.trim())) {
            alert("Billing Address Pincode must be a valid number.");
            return false;
        }

        // Validate Tax Details
        if (!taxDetails?.taxStatus) {
            alert("Please select a Tax Preference.");
            return false;
        }

        if (taxDetails.taxStatus === "gstRegistered") {
            if (!taxDetails?.sourceState?.trim()) {
                alert("Please select the Source State.");
                return false;
            }

            // Validate GSTIN Length and Format
            if (!gstinRegex.test(taxDetails?.gstin?.trim())) {
                alert(
                    "Please enter a valid GSTIN (15 characters, proper format: ##AAAAA####A#Z#)."
                );
                return false;
            }
        }

        // Validate Currency
        if (!formData.currency) {
            alert("Please select currency.");
            return false;
        }
        
        return true; // All validations passed
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const isValid = validateForm(); // Call the validation function

        if (!isValid) {
            return; // Stop submission if validation fails
        }

        // Proceed with form submission after validation
        console.log("Form data:", formData);
        // Add your async submit logic here
    };
    return (
        <UserLayout>
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex flex-col relative h-full w-full text-start overflow-scroll">
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
                                    handleChange={(field, value) => handleBankChange(index, field, value)} // Pass index to handle dynamic updates
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