import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import Alert from '../../Alert';
import axios from 'axios';

const ViewVendor = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [vendor, setVendor] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
    const [alert, setAlert] = useState(null);
    const [openSections, setOpenSections] = useState({
        address: false,
        tax: false,
        bank: false,
        customDetails: false,
        other: false
    });

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

    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    if (!vendor) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <UserLayout>
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

            <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                <p>Vendors</p>
                <div className='flex items-center'>
                    <Link to={`/editvendor/${id}`} className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                        Edit
                    </Link>
                </div>
            </div>
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b">
                <button
                    type="button"
                    className={`py-2 px-4 ${activeTab === "overview" ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="flex flex-wrap w-full h-full mb-10 overflow-scroll">
                    <div className="h-full text-gray-700 bg-slate-50 border-r px-4 py-2 w-72">
                        <div className='text-start text-md py-2 px-1'>
                            {vendor.displayName}
                        </div>
                        <hr />
                        <div className='flex py-2'>
                            <div className='flex items-center justify-center w-10 h-10 m-1 text-white bg-gray-300 rounded-md'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round"><path d="M18 20a6 6 0 0 0-12 0" /><circle cx="12" cy="10" r="4" /><circle cx="12" cy="12" r="10" /></svg>
                            </div>
                            <div className='text-start text-sm m-1'>
                                <p className='font-semibold'>{vendor.primaryPerson || vendor.vendorOrganizationName}</p>
                                <p>{vendor.emailAddress || '-'}</p>
                                <p>{vendor.phone || '-'}</p>
                            </div>
                        </div>
                        <button onClick={() => toggleSection('address')} className='flex justify-between items-center w-full pt-4 text-sm font-semibold text-start'>
                            <p>Address</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <hr />
                        {openSections.address && (
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.address ? 'max-h-screen' : 'max-h-0'}`}>
                                <div className='flex flex-col text-start text-sm py-2'>
                                    <p className='font-semibold'>Shipping Address</p>
                                    <p>{vendor.shippingAddress.addressLine1}</p>
                                    <p>{vendor.shippingAddress.city},{vendor.shippingAddress.state}-{vendor.shippingAddress.postalCode}</p>
                                    <p>{vendor.shippingAddress.country === 'IN' ? 'India' : 'vendor.shippingAddress.country'}</p>
                                </div>
                                <div className='flex flex-col text-start text-sm py-2'>
                                    <p className='font-semibold'>Billing Address</p>
                                    <p>{vendor.billingAddress.addressLine1}</p>
                                    <p>{vendor.billingAddress.city},{vendor.billingAddress.state}-{vendor.billingAddress.postalCode}</p>
                                    <p>{vendor.billingAddress.country === 'IN' ? 'India' : 'vendor.billingAddress.country'}</p>
                                </div>
                            </div>
                        )}
                        <button onClick={() => toggleSection('tax')} className='flex justify-between items-center w-full pt-4 text-sm font-semibold text-start'>
                            <p>Tax</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <hr />
                        {openSections.tax && (
                            <div className={`flex overflow-hidden transition-all duration-300 ease-in-out ${openSections.tax ? 'max-h-screen' : 'max-h-0'}`}>
                                <div className='flex flex-col text-start text-sm text-gray-500 py-2'>
                                    <p>GST Preference</p>
                                    <p>Source State</p>
                                    <p>GSTIN</p>
                                    <p>PAN Number</p>
                                </div>
                                <div className='flex flex-col text-start text-sm py-2 ps-2'>
                                    <p>{vendor.taxDetails.taxStatus === 'unregistered' ? 'Unregistered' : 'Registered'}</p>
                                    <p>{vendor.taxDetails.sourceState || '-'}</p>
                                    <p>{vendor.taxDetails.gstin || '-'}</p>
                                    <p>{vendor.taxDetails.panNumber || '-'}</p>
                                </div>
                            </div>
                        )}
                        <button onClick={() => toggleSection('bank')} className='flex justify-between items-center w-full pt-4 text-sm font-semibold text-start'>
                            <p>Bank Details</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <hr />
                        {openSections.bank && (
                            <div
                                className={`flex overflow-hidden transition-all duration-300 ease-in-out ${openSections.bank ? 'max-h-screen' : 'max-h-0'
                                    }`}
                            >
                                {vendor.bankDetails.map((bank, index) => (
                                    <div className='text-start'>
                                        <p className='font-semibold text-sm py-2' >Account {index + 1}</p>
                                        <div key={index} className="flex text-start text-sm pb-2">
                                            <div className='flex flex-col text-start text-sm text-gray-500 py-2'>
                                                <p>Account Number</p>
                                                <p>Account Holder Name</p>
                                                <p>Bank Name</p>
                                                <p>IFSC:</p>
                                            </div>
                                            <div className='flex flex-col text-start text-sm py-2 ps-2'>
                                                <p>{bank.accountNumber || '-'}</p>
                                                <p>{bank.accountHolderName || '-'}</p>
                                                <p>{bank.bankName || '-'}</p>
                                                <p>{bank.ifscCode || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => toggleSection('customDetails')} className='flex justify-between items-center w-full pt-4 text-sm font-semibold text-start'>
                            <p>Custom Details</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <hr />
                        {openSections.customDetails && (
                            <div
                                className={`flex overflow-hidden transition-all duration-300 ease-in-out ${openSections.customDetails ? 'max-h-screen' : 'max-h-0'
                                    }`}
                            >
                                {vendor.customFields.map((customDetails, index) => (
                                    <div key={index} className="flex text-start text-sm py-2">
                                        <div className='flex flex-col text-start text-sm text-gray-500 py-2'>
                                            <p>{customDetails.fieldName || ''}</p>
                                        </div>
                                        <div className='flex flex-col text-start text-sm py-2 ps-2'>
                                            <p>{customDetails.fieldValue || ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => toggleSection('other')} className='flex justify-between items-center w-full pt-4 text-sm font-semibold text-start'>
                            <p>Other Details</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <hr />
                        {openSections.other && (
                            <div
                                className={`flex overflow-hidden transition-all duration-300 ease-in-out ${openSections.other ? 'max-h-screen' : 'max-h-0'
                                    }`}
                            >
                                <div className="flex text-start text-sm py-2">
                                    <div className='flex flex-col text-start text-sm text-gray-500 py-2'>
                                        <p>Currency</p>
                                    </div>
                                    <div className='flex flex-col text-start text-sm py-2 ps-2'>
                                        <p>{vendor.currency || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {
                alert && (
                    <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
                )
            }
        </UserLayout >
    )
}

export default ViewVendor
