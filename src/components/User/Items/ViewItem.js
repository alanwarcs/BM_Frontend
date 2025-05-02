import React, { useState, useEffect } from 'react';
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Alert from '../../Alert';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ViewItem = () => {
    const { id } = useParams();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [item, setItem] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [storageDetails, setStorageDetails] = useState(null);
    const [showStatistics, setShowStatistics] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, message: '', x: 0, y: 0 });
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

                // Fetch Storage Details
                if (response.data.itemDetails.storage && response.data.itemDetails.storage.length > 0) {
                    const storageDetailsPromises = response.data.itemDetails.storage.map(async (storageItem) => {
                        try {
                            const storageResponse = await axios.get(`/api/storage/getStorageDetails/${storageItem.storage}`);
                            return storageResponse.data.storage; // Assuming the API returns a structure like { storage: { ... } }
                        } catch (error) {
                            return null; // Return null in case of an error
                        }
                    });

                    // Wait for all promises to resolve
                    const storageDetailsResults = await Promise.all(storageDetailsPromises);
                    // Filter out any null results (failed fetches)
                    setStorageDetails(storageDetailsResults.filter(result => result !== null));
                }

            } catch (error) {
                setAlert({ message: "Failed to load item.", type: "error" });
            }
        }

        if (id) {
            fetchItem();
        }

    }, [id]);

    const data = [
        { name: 'Day 1', sales: 500 },
        { name: 'Day 2', sales: 3000 },
        { name: 'Day 3', sales: 2000 },
        { name: 'Day 4', sales: 2780 },
        { name: 'Day 5', sales: 1890 },
        { name: 'Day 6', sales: 2390 },
        { name: 'Day 7', sales: 3490 },
    ];

    const revenueData = [
        { year: '2020', revenue: 20000 },
        { year: '2021', revenue: 10000 },
        { year: '2022', revenue: 40000 },
        { year: '2023', revenue: 30000 },
    ];

    const handleInfoClick = (message, event) => {
        setTooltip({
            show: true,
            message: message,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ show: false, message: '', x: 0, y: 0 });
    };

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
                        <Link to="/items" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
                            Items
                        </Link>
                        <button
                            className='p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400'
                            onClick={() => setShowStatistics(!showStatistics)}
                        >
                            {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
                        </button>
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
                    <div className='flex flex-col items-center justify-between w-full m-2'>
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
                                <div className="text-sm mx-auto">
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
                                <div className="text-sm mx-auto">
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
                                <div className="w-fit space-y-4">
                                    <div className="overflow-scroll rounded-md mb-2 border border-gray-200">
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
                                                        <td className="px-4 py-2 max-w-80 text-gray-800 capitalize text-balance">{unit.description || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='w-full m-2 bg-gray-400' />

                        <div className='flex flex-col items-center justify-center w-full m-2'>
                            <div className='w-full p-3'>
                                <p className='font-semibold pb-2'>Storage Detail</p>

                                <div className="w-fit space-y-4 mb-2">
                                    <div className="rounded-md border border-gray-200 overflow-scroll">
                                        <table className="min-w-full divide-y divide-gray-200 ">
                                            <thead className="bg-gray-100 rounded-t-md">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sr No.</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Storage</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Location</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {item.storage.map((storage, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-gray-800 capitalize">{index + 1}</td>
                                                        <td className="px-4 py-2 text-gray-800 capitalize">
                                                            {storageDetails && storageDetails[index] ? storageDetails[index].storageName : '—'}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-800 capitalize">
                                                            {storageDetails && storageDetails[index] ? storageDetails[index].storageAddress : '—'}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-800 capitalize">{storage.quantity || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Section */}
                    {showStatistics && (
                        <div className='absolute top-0 left-0 h-full w-full md:w-[500px] bg-white text-gray-600 shadow-md overflow-auto py-2'>
                            <div className='flex flex-col bg-white w-11/12 capitalize rounded-lg p-4 m-2'>
                                <div className='flex flex-col h-fit pb-4 relative'>
                                    <span className='flex items-center'>
                                        <p className='text-base font-bold p-0 me-2'>Item Seles</p>
                                        <button
                                            onClick={(e) => handleInfoClick("This graph shows the sales trend of the item over the last 7 days.", e)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info text-customPrimary"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                        </button>
                                    </span>
                                    <p className='text-xs p-0 text-gray-400'>Last 7 Days</p>
                                </div>
                                <hr />
                                <ResponsiveContainer width="100%" height={250} className='mt-4'>
                                    <LineChart
                                        data={data}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className='flex flex-col bg-white w-11/12 capitalize rounded-lg p-4 m-2'>
                                <div className='flex flex-col h-fit pb-4 relative'>
                                    <span className='flex items-center'>
                                        <p className='text-base font-bold p-0 me-2'>Revenue per Year</p>
                                        <button
                                            onClick={(e) => handleInfoClick("This graph displays the revenue generated by the item for the past 4 years.", e)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info text-customPrimary"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                        </button>
                                    </span>
                                    <p className='text-xs p-0 text-gray-400'>Past 4 Years</p>
                                </div>
                                <hr />
                                <ResponsiveContainer width="100%" height={250} className='mt-4'>
                                    <LineChart
                                        data={revenueData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <button className='absolute top-0 right-0 p-4' onClick={() => setShowStatistics(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltip */}
            {tooltip.show && (
                <div
                    className="absolute z-50 w-48 bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-700"
                    style={{
                        top: tooltip.y + 10,
                        left: tooltip.x + 10,
                    }}
                    onMouseLeave={handleMouseLeave}
                >
                    {tooltip.message}
                </div>
            )}
        </UserLayout >
    )
}

export default ViewItem
