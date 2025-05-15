import React, { useState, useEffect } from 'react';
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Alert from '../../Alert';
import axios from 'axios';

const ViewItem = () => {
    const { id } = useParams();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [item, setItem] = useState(null);
    const [vendor, setVendor] = useState(null);;
    const navigate = useNavigate();

    // Fetch vendors and storages from backend
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`/api/item/getItemDetails/${id}`);
                setItem(response.data.itemDetails);
                setLoadingProgress(100);

                setTimeout(() => {
                    setLoadingProgress(0);
                }, 1000);

                // Fetch Vendor Details
                if (response.data.itemDetails.purchaseInfo.vendorId) {
                    const vendorResponse = await axios.get(`/api/vendor/getVendorDetails/${response.data.itemDetails.purchaseInfo.vendorId}`);
                    setVendor(vendorResponse.data.vendorDetails);
                }

                if (response.data.itemDetails.storage.storage) {
                    const vendorResponse = await axios.get(`/api/vendor/getVendorDetails/${response.data.itemDetails.purchaseInfo.vendorId}`);
                    setVendor(vendorResponse.data.vendorDetails);
                }

            } catch (error) {
                setAlert({ message: "Failed to load item.", type: "error" });
            }
        }

        if (id) {
            fetchItem();
        }

    }, [id]);


    if (!item) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    // Calculate total quantity in stock
    const totalQuantityInStock = item.storage.reduce((acc, storage) => acc + storage.quantity, 0);

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}

            <div className="flex flex-col relative h-full text-start text-sm">
                <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
                    <p>Item Details</p>
                    <div className="flex">
                        <Link to="/addstorage" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
                            Statistics
                        </Link>
                        <Link to="/items" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
                            Items
                        </Link>
                    </div>
                </div>

                <hr />

                <div className="flex flex-row px-3 py-2">
                    <div className='flex w-20 h-20 bg-gray-100 rounded'>
                        {
                            item.itemType === "Product" ? (
                                <div className="flex items-center justify-center w-full h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-basket-icon lucide-shopping-basket text-gray-400"><path d="m15 11-1 9" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" /><path d="M4.5 15.5h15" /><path d="m5 11 4-7" /><path d="m9 11 1 9" /></svg>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hand-helping-icon lucide-hand-helping text-gray-400"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" /><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" /><path d="m2 13 6 6" /></svg>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex flex-col px-3">
                        <p className='text-2xl py-1'>{item.itemName}</p>

                        <div className="flex items-center divide-gray-300 py-1">
                            <span className="flex text-sm text-gray-500">
                                <p className='ps-1 font-bold text-gray-600'>
                                    {item.sellInfo.price}
                                </p>
                                <p className='ps-1'>
                                    {item.sellInfo.currency}
                                </p>
                            </span>
                            <span className="px-1">&bull;</span>
                            <p className="text-sm font- text-gray-500">
                                {item.itemType}
                            </p>
                            {item.sku && (
                                <>
                                    <span className="px-1">&bull;</span>
                                    <p className="text-sm text-gray-500">
                                        {item.sku}
                                    </p>
                                    <button className='p-2 text-customPrimary'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <hr />

                <div className='flex flex-row bg-gray-50 h-full overflow-scroll'>
                    <div className='flex flex-col items-center justify-between width m-2'>
                        <div className='w-full p-3'>
                            <p className='font-semibold pb-2'>Total Stock Value</p>
                            <span className='flex text-2xl'>
                                {item.stockValue}
                                <p className='ps-2'>{item.purchaseInfo.purchaseCurrency}</p>
                            </span>
                            <p className='text-gray-600 text-sm'>{totalQuantityInStock} Available Qauntity</p>
                        </div>

                        <hr className='w-full m-2 bg-gray-400' />

                        <div className='flex flex-col items-center justify-center w-full m-2'>
                            <div className='w-full p-3'>
                                <p className='font-semibold pb-2'>Details</p>
                                <div className="max-w-xl text-sm mx-auto">
                                    {/* Name */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">Name:</span>
                                        <span className="text-gray-800">{item.itemName || '—'}</span>
                                    </div>

                                    {/* SKU */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">SKU:</span>
                                        <span className="text-gray-800">{item.sku || '—'}</span>
                                    </div>

                                    {/* HSN */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">HSN/SAC:</span>
                                        <span className="text-gray-800">{item.hsnOrSac || '—'}</span>
                                    </div>

                                    {/* Purchase Price */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">Purchase Price:</span>
                                        <span className="text-gray-800">{item.purchaseInfo.purchasePrice || '—'} {item.purchaseInfo.purchaseCurrency || '—'}</span>
                                    </div>

                                    {/* Preferred Vendor */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">Preferred Vendor:</span>
                                        <span className="text-gray-800">{vendor?.displayName || '—'}</span>
                                        <span className='ps-2'>
                                            <button onClick={() => navigate(`/vendor/${vendor?._id}`)} className='text-customPrimary underline'>Details</button>
                                        </span>
                                    </div>

                                    {/* Created At */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">Created At:</span>
                                        <span className="text-gray-800">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                                        </span>
                                    </div>

                                    {/* Updated At */}
                                    <div className="flex items-center mb-1">
                                        <span className="w-32 font-medium text-gray-600">Updated At:</span>
                                        <span className="text-gray-800">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <hr className='w-full m-2 bg-gray-400' />

                        <div className='flex flex-col items-center justify-center w-full m-2'>
                            <div className='w-full p-3'>
                                <p className='font-semibold pb-2'>Tax</p>
                                <div className="max-w-xl text-sm mx-auto">
                                    {/* Tax Preference */}
                                    <div className="flex items-center">
                                        <span className="w-32 font-medium text-gray-600">Tax Preference</span>
                                        <span className="text-gray-800">{item.taxPreference || '—'}</span>
                                    </div>
                                    {
                                        item.taxPreference === "GST Inclusive" && (
                                            <>
                                                {/* GSTRATES */}
                                                <div className="flex flex-col">
                                                    <div className='flex items-center'>
                                                        <span className="w-32 font-medium text-gray-600">SGST</span>
                                                        <span className="text-gray-800">{item.gst.intraStateGST}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className='flex items-center'>
                                                            <span className="w-32 font-medium text-gray-600">CGST</span>
                                                            <span className="text-gray-800">{item.gst.interStateGST}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                        </div>

                        <hr className='w-full m-2 bg-gray-400' />

                        <div className='flex flex-col items-center justify-center w-full m-2'>
                            <div className='w-full p-3'>
                                <p className='font-semibold pb-2'>Units</p>
                            </div>
                            <div className="w-full space-y-4">
                                <div className="overflow-hidden rounded-md mb-2 border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100 rounded-t-md">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sr No.</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Value</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Unit</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {item.units.map((unit, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{index + 1}</td>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{unit.category || '—'}</td>
                                                    <td className="px-4 py-2 text-gray-800">{unit.value ?? '—'}</td>
                                                    <td className="px-4 py-2 text-gray-800">{unit.unit || '—'}</td>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{unit.description || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <hr className='w-full m-2 bg-gray-400' />

                        <div className='flex flex-col items-center justify-center w-full m-2'>
                            <div className='w-full p-3'>
                                <p className='font-semibold pb-2'>Storage Detail</p>
                            </div>
                            <div className="w-full space-y-4 mb-2">
                                <div className="overflow-hidden rounded-md border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100 rounded-t-md">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sr No.</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Storage</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {item.storage.map((storage, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{index + 1}</td>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{storage.storage || '—'}</td>
                                                    <td className="px-4 py-2 text-gray-800 capitalize">{storage.quantity || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col w-1/2 py-2'>

                    </div>
                </div>
            </div>

            {/* Alert */}
            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    )
}

export default ViewItem
