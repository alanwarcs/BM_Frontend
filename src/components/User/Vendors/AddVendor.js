import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
import AddressTab from '../ReusableComponents/AddressTab';
import TextInput from '../ReusableComponents/TextInput';
import SelectInput from '../ReusableComponents/SelectInput';
import TaxTab from '../ReusableComponents/TaxTab';
import BankTab from '../ReusableComponents/BankTab';
import LoadingBar from '../../LoadingBar';
import Alert from '../../Alert';
import axios from 'axios';

const AddVendor = () => {
    const [activeTab, setActiveTab] = useState("address");
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({
        vendorOrganizationName: '',
        primaryPerson: '',
        displayName: '',
        emailAddress: '',
        phone: '',

        shippingAddress: {
            addressLine1: '',
            city: '',
            state: '',
            country: 'IN',
            postalCode: '',
        },

        billingAddress: {
            addressLine1: '',
            city: '',
            state: '',
            country: 'IN',
            postalCode: '',
        },

        taxDetails: {
            taxStatus: '',
            sourceState: '',
            gstin: '',
            panNumber: '',
        },

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

        customFields: [
            {
                fieldName: '',
                fieldValue: ''
            },
        ],
    });

    const MAX_BANKS = 4;
    const MAX_CUSTOM_FIELDS = 5;

    //Handle Chnage in Fields
    const handleChange = (nameOrEvent, value) => {
        if (typeof nameOrEvent === "string") {

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

                setFormData((prevData) => ({
                    ...prevData,
                    [nameOrEvent]: value,
                }));
            }
        } else {
            const { name, value: eventValue } = nameOrEvent.target;
            if (!name) {
                console.error("Field name is missing in the event target", nameOrEvent);
                return;
            }
            handleChange(name, eventValue);
        }
    };

    //Handle Copy shipping address to billing address on click
    const copyShippingToBilling = () => {
        setFormData((prev) => ({
            ...prev,
            billingAddress: prev.shippingAddress,
        }));
    };

    //Handle Change in Custom Fileds
    const handleCustomFieldChange = (index, field, value) => {
        setFormData((prevData) => {
            const updatedCustomFields = [...prevData.customFields];
            updatedCustomFields[index][field] = value;
            return { ...prevData, customFields: updatedCustomFields };
        });
    };

    //Add more than 1 custom detail
    const addCustomField = () => {
        setFormData((prevData) => {
            if (prevData.customFields.length < MAX_CUSTOM_FIELDS) {
                return {
                    ...prevData,
                    customFields: [...prevData.customFields, { fieldName: '', fieldValue: '' }],
                };
            } else {
                alert(`You can only add up to ${MAX_CUSTOM_FIELDS} custom fields.`);
                return prevData;
            }
        });
    };

    //Remove Custom detail
    const removeCustomField = (index) => {
        setFormData((prevData) => {
            const updatedCustomFields = prevData.customFields.filter((_, i) => i !== index);
            return { ...prevData, customFields: updatedCustomFields };
        });
    };

    //Handle Change in Bank Fileds
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

    //Add more than 1 bank detail
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

    //Remove bank detail
    const removeBank = (index) => {
        const updatedBankDetails = formData.bankDetails.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, bankDetails: updatedBankDetails }));
    };

    //Display name option as organization name and Primary Person Name
    const displayNameOptions = [
        formData.primaryPerson && { value: formData.primaryPerson, label: formData.primaryPerson },
        formData.vendorOrganizationName && { value: formData.vendorOrganizationName, label: formData.vendorOrganizationName },
    ].filter(Boolean);

    //Validate Form Fields
    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

        if (!formData.displayName?.trim()) {
            setAlert({
                message: 'Display Name is required.',
                type: 'error',
            });
            return false;
        }

        if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
            setAlert({
                message: 'Invalid email address format.',
                type: 'error',
            });
            return false;
        }

        const { shippingAddress, billingAddress, taxDetails } = formData;

        if (
            !shippingAddress?.addressLine1?.trim() ||
            !shippingAddress?.city?.trim() ||
            !shippingAddress?.state?.trim() ||
            !shippingAddress?.country?.trim()
        ) {
            setAlert({
                message: 'Complete shipping address is required.',
                type: 'error',
            });
            return false;
        }

        if (!/^\d+$/.test(shippingAddress?.postalCode?.trim())) {
            setAlert({
                message: 'Invalid postal code for shipping address.',
                type: 'error',
            });
            return false;
        }

        if (
            !billingAddress?.addressLine1?.trim() ||
            !billingAddress?.city?.trim() ||
            !billingAddress?.state?.trim() ||
            !billingAddress?.country?.trim()
        ) {
            setAlert({
                message: 'Complete billing address is required.',
                type: 'error',
            });
            return false;
        }

        if (!/^\d+$/.test(billingAddress?.postalCode?.trim())) {
            setAlert({
                message: 'Invalid postal code for billing address.',
                type: 'error',
            });
            return false;
        }

        if (!taxDetails?.taxStatus) {
            setAlert({
                message: 'Tax status is required.',
                type: 'error',
            });
            return false;
        }

        if (taxDetails.taxStatus === 'gstRegistered') {
            if (!taxDetails?.sourceState?.trim()) {
                setAlert({
                    message: 'Source state is required for GST registered entities.',
                    type: 'error',
                });
                return false;
            }

            if (!gstinRegex.test(taxDetails?.gstin?.trim())) {
                setAlert({
                    message: 'Invalid GSTIN format.',
                    type: 'error',
                });
                return false;
            }
        }

        if (!formData.currency) {
            setAlert({
                message: 'Currency is required.',
                type: 'error',
            });
            return false;
        }

        return true;
    };

    //Handle Submit to Add Vendor
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingProgress(20);

        if (!validateForm()) {
            setLoadingProgress(0);
            return;
        }

        setLoadingProgress(50);

        try {
            const response = await axios.post('/api/vendor/addVendors', formData);

            if (response.status === 201) {
                setAlert({
                    message: 'Vendor added successfully!',
                    type: 'success',
                });

                setLoadingProgress(100);

                setFormData({
                    vendorOrganizationName: '',
                    primaryPerson: '',
                    displayName: '',
                    emailAddress: '',
                    phone: '',
                    shippingAddress: {
                        addressLine1: '',
                        city: '',
                        state: '',
                        country: 'IN',
                        postalCode: '',
                    },
                    billingAddress: {
                        addressLine1: '',
                        city: '',
                        state: '',
                        country: 'IN',
                        postalCode: '',
                    },
                    taxDetails: {
                        taxStatus: '',
                        sourceState: '',
                        gstin: '',
                        panNumber: '',
                    },
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
                    customFields: [
                        {
                            fieldName: '',
                            fieldValue: '',
                        },
                    ],
                });
            }

            setTimeout(() => {
                setLoadingProgress(0);
            }, 1000);

        } catch (error) {
            setAlert({
                message: error.response?.data?.message || '500 - Internal server error.',
                type: 'error',
            });
            setLoadingProgress(0);
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

            <form onSubmit={handleSubmit} className="flex flex-col relative h-full w-full text-start">
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Add Vendor</p>
                    <Link to="/vendor" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">Vendors List</Link>
                </div>

                <hr />

                <div className='h-full overflow-scroll px-4'>
                    <div className='flex flex-wrap'>
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
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-4 border-b w-full overflow-y-scroll scrollbar-hide">
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
                            className={`py-2 px-4 whitespace-nowrap ${activeTab === "customFields" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
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
                                        className="text-red-500 text-sm px-2"
                                        onClick={() => removeBank(index)}
                                    >
                                        Remove Bank
                                    </button>
                                </div>
                            ))}
                            {formData.bankDetails.length < MAX_BANKS && (
                                <div className='text-center'>
                                    <button
                                        type="button"
                                        className="text-gray-400 text-sm hover:underline"
                                        onClick={addBank}
                                    >
                                        + Add Another Bank
                                    </button>
                                </div>
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
                            {formData.customFields.map((field, index) => (
                                <div key={index} className="p-4 mb-2">
                                    <TextInput
                                        id={`fieldName-${index}`}
                                        label="Field Name"
                                        value={field.fieldName}
                                        onChange={(e) => handleCustomFieldChange(index, 'fieldName', e.target.value)}
                                    />
                                    <TextInput
                                        id={`fieldValue-${index}`}
                                        label="Value"
                                        value={field.fieldValue}
                                        onChange={(e) => handleCustomFieldChange(index, 'fieldValue', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCustomField(index)}
                                        className="text-red-500 text-sm px-2"
                                    >
                                        Remove Fields
                                    </button>
                                </div>
                            ))}
                            {formData.customFields.length < MAX_CUSTOM_FIELDS && (
                                <div className='text-center'>
                                    <button
                                        type="button"
                                        onClick={addCustomField}
                                        className="text-gray-400 text-sm hover:underline"
                                    >
                                        + Add Custom Field
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='px-4 w-full bottom-0 bg-white border-t'>
                    <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]">
                        Submit
                    </button>
                </div>
            </form>

            {alert && (
                <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
            )}
        </UserLayout>
    );
};

export default AddVendor;