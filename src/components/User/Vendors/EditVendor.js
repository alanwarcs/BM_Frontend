import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout'; // Import UserLayout for consistent page structure
import AddressTab from '../ReusableComponents/AddressTab';
import TextInput from '../ReusableComponents/TextInput';
import SelectInput from '../ReusableComponents/SelectInput';
import TaxTab from '../ReusableComponents/TaxTab';
import BankTab from '../ReusableComponents/BankTab';
import LoadingBar from '../../LoadingBar'; // Import the LoadingBar component
import Alert from '../../Alert';
import axios from 'axios';


const EditVendor = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [activeTab, setActiveTab] = useState("address");
    const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
    const [alert, setAlert] = useState(null);

    const MAX_BANKS = 4;
    const MAX_CUSTOM_FIELDS = 5;

    //Fetch Vendor Based on ID
    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await axios.get(`/api/vendor/getVendorDetails/${id}`);
                setVendor(response.data.vendorDetails);
                setLoadingProgress(100);


                setTimeout(() => {
                    setLoadingProgress(0);
                }, 1000);
            } catch (error) {
                setAlert({
                    message: error.response?.data?.message || '500 - Internal server error.',
                    type: 'error',
                });
            }
        };

        if (id) {
            fetchVendor();
        }
    }, [id]);

    //Handle Chnage in Fields
    const handleChange = (nameOrEvent, value) => {
        if (typeof nameOrEvent === "string") {
            // Handle nested fields like "taxDetails.gstin"
            if (nameOrEvent.includes('.')) {
                const keys = nameOrEvent.split('.');
                setVendor((prevData) => {
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
                setVendor((prevData) => ({
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

    //Display name option as organization name and Primary Person Name
    const displayNameOptions = vendor
        ? [
            vendor.primaryPerson && { value: vendor.primaryPerson, label: vendor.primaryPerson },
            vendor.vendorOrganizationName && { value: vendor.vendorOrganizationName, label: vendor.vendorOrganizationName },
        ].filter(Boolean)
        : []

    //Handle Copy shipping address to billing address on click
    const copyShippingToBilling = () => {
        setVendor((prev) => ({
            ...prev,
            billingAddress: prev.shippingAddress,
        }));
    };

    //Handle Change in Bank Fileds
    const handleBankChange = (index, field, value) => {
        setVendor((prev) => {
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
        if (vendor.bankDetails.length < MAX_BANKS) {
            setVendor((prev) => ({
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
        const updatedBankDetails = vendor.bankDetails.filter((_, i) => i !== index);
        setVendor((prev) => ({ ...prev, bankDetails: updatedBankDetails }));
    };

    //Handle Change in Custom Fileds
    const handleCustomFieldChange = (index, field, value) => {
        setVendor((prevData) => {
            const updatedCustomFields = [...prevData.customFields];
            updatedCustomFields[index][field] = value;
            return { ...prevData, customFields: updatedCustomFields };
        });
    };

    // Add Custom Field with limit
    const addCustomField = () => {
        setVendor((prevData) => {
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
        setVendor((prevData) => {
            const updatedCustomFields = prevData.customFields.filter((_, i) => i !== index);
            return { ...prevData, customFields: updatedCustomFields };
        });
    };

    // Form validation
    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

        if (!vendor.displayName?.trim()) {
            setAlert({
                message: 'Display Name is required.',
                type: 'error',
            });
            return false;
        }

        if (vendor.emailAddress && !emailRegex.test(vendor.emailAddress)) {
            setAlert({
                message: 'Invalid email address format.',
                type: 'error',
            });
            return false;
        }

        const { shippingAddress, billingAddress, taxDetails } = vendor;

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

        if (!vendor.currency) {
            setAlert({
                message: 'Currency is required.',
                type: 'error',
            });
            return false;
        }

        return true;
    };

    //Handle Updated Chnage Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingProgress(20);

        if (!validateForm()) {
            setLoadingProgress(0);
            return;
        }

        setLoadingProgress(50);

        try {
            const response = await axios.put(`/api/vendor/updateVendor/${id}`, vendor);

            if (response.status === 200) {
                if (alert?.type !== 'success') {
                    setAlert({
                        message: 'Vendor updated successfully!',
                        type: 'success',
                    });
                }
                setLoadingProgress(100);
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

    if (!vendor) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <UserLayout>
            {/* Form Section */}
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

            <form onSubmit={handleSubmit} className="flex flex-col relative h-full w-full text-start">
                {/* Page Header */}
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Edit Vendor</p>
                    <Link to="/vendor" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">Vendors List</Link>
                </div>

                <hr />

                <div className='h-full overflow-y-scroll px-4 no-scrollbar'>
                    <div className='flex flex-wrap'>
                        {/* Organization/Business Name */}
                        <TextInput
                            label="Organization/Business Name"
                            id="vendorOrganizationName"
                            value={vendor.vendorOrganizationName}
                            onChange={(e) => handleChange("vendorOrganizationName", e.target.value)}
                            placeholder="Enter organization/business name"
                        />

                        {/* Primary Person */}
                        <TextInput
                            label="Primary Person"
                            id="primaryPerson"
                            value={vendor.primaryPerson}
                            onChange={(e) => handleChange("primaryPerson", e.target.value)}
                            placeholder="Enter primary person name"
                        />

                        {/* Display Name */}
                        <SelectInput
                            id="displayName"
                            label="Display Name"
                            required
                            value={vendor.displayName}
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
                                    value={vendor.emailAddress}
                                    onChange={(e) => handleChange("emailAddress", e.target.value)}
                                    placeholder="Enter email address"
                                    type="email"
                                />
                                {/* Phone */}
                                <TextInput
                                    label="Phone"
                                    id="phone"
                                    value={vendor.phone}
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
                            <AddressTab formData={vendor} handleChange={handleChange} copyShippingToBilling={copyShippingToBilling} />
                        </div>
                    )}

                    {activeTab === "tax" && (
                        <TaxTab formData={vendor} handleChange={handleChange} />
                    )}

                    {activeTab === "bank" && (
                        <div>
                            {vendor.bankDetails.map((bank, index) => (
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
                            {vendor.bankDetails.length < MAX_BANKS && (
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
                                    value={vendor.currency}
                                    onChange={(e) => handleChange("currency", e.target.value)}
                                    options={[
                                        { value: 'INR', label: 'INR' },
                                    ]}
                                />

                                {/* Tags */}
                                <TextInput
                                    label="Tags"
                                    id="tags"
                                    value={vendor.tags}
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
                                        value={vendor.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        placeholder="Enter any additional notes or information"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "customFields" && (
                        <div>
                            {vendor.customFields.map((field, index) => (
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
                            {vendor.customFields.length < MAX_CUSTOM_FIELDS && (
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

export default EditVendor;
