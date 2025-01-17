import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from './UserLayout';
import LoadingBar from '../LoadingBar';
import Alert from '../Alert';
import axios from 'axios';

const Vendor = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedVendors, setSelectedVendors] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);

    const navigate = useNavigate();

    // Function to fetch vendors with pagination
    const fetchVendors = async (page = 1) => {
        try {
            setLoadingProgress(30);
            const response = await axios.get(`/api/vendor/vendors?page=${page}&limit=10`);
            setLoadingProgress(70);

            if (response.data.success) {
                setVendors(response.data.vendors);
                setCurrentPage(page);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setLoadingProgress(100);

                setTimeout(() => setLoadingProgress(0), 1000);
            } else {
                setLoadingProgress(100);
                setAlert({ message: response.data.message, type: 'error' });
                setTimeout(() => setLoadingProgress(0), 1000);
            }
        } catch (error) {
            setLoadingProgress(100);
            console.error(error);
            setAlert({ message: 'Error fetching vendors. Please try again.', type: 'error' });
        }
    };

    // Function to delete a vendor
    const deleteVendor = async (vendorId) => {
        try {
            setLoadingProgress(30);
            const response = await axios.delete(`/api/vendor/vendors/${vendorId}`);
            setLoadingProgress(70);

            if (response.data.success) {
                setAlert({ message: 'Vendor deleted successfully!', type: 'success' });
                fetchVendors(currentPage); // Refresh the vendor list
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        } catch (error) {
            setLoadingProgress(100);
            console.error(error);
            setAlert({ message: 'Error deleting vendor. Please try again.', type: 'error' });
        }
    };

    useEffect(() => {
        fetchVendors(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            fetchVendors(page);
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}
            <div className="flex flex-col relative h-full w-full text-start">
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Vendors</p>
                    <Link
                        to="/addVendor"
                        className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400 hover:bg-gray-200 transition"
                    >
                        + Add New
                    </Link>
                </div>
                <hr />
                <div className="text-center">
                    {vendors.length > 0 ? (
                        <div className="relative overflow-visible">
                            <table className="w-full text-sm text-left rtl:text-right">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="ps-4 py-2">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const allSelected = vendors.reduce((acc, vendor) => {
                                                        acc[vendor._id] = checked;
                                                        return acc;
                                                    }, {});
                                                    setSelectedVendors(allSelected);
                                                }}
                                                checked={vendors.every((vendor) => selectedVendors[vendor._id])}
                                            />
                                        </th>
                                        <th className="pe-6 py-2">Name</th>
                                        <th className="px-6 py-2">Company Name</th>
                                        <th className="px-6 py-2">Email</th>
                                        <th className="px-6 py-2">Phone</th>
                                        <th className="px-6 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map((vendor) => (
                                        <tr key={vendor._id} className="bg-white border-b">
                                            <td className="ps-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setSelectedVendors((prev) => ({
                                                        ...prev,
                                                        [vendor._id]: !prev[vendor._id],
                                                    }))}
                                                    checked={!!selectedVendors[vendor._id]}
                                                />
                                            </td>
                                            <td className="pe-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {vendor.primaryPerson || '-'}
                                            </td>
                                            <td className="px-6 py-2">
                                                {vendor.vendorOrganizationName || '-'}
                                            </td>
                                            <td className="px-6 py-2">{vendor.emailAddress || '-'}</td>
                                            <td className="px-6 py-2">{vendor.phone || '-'}</td>
                                            <td className="px-6 py-2">
                                                <div className="relative">
                                                    <button
                                                        className="text-gray-600 focus:outline-none"
                                                        onClick={() =>
                                                            setOpenDropdown((prev) => (prev === vendor._id ? null : vendor._id))
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="lucide lucide-ellipsis-vertical"
                                                        >
                                                            <circle cx="12" cy="12" r="1" />
                                                            <circle cx="12" cy="5" r="1" />
                                                            <circle cx="12" cy="19" r="1" />
                                                        </svg>
                                                    </button>
                                                    {openDropdown === vendor._id && (
                                                        <div className="absolute right-0 z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-24">
                                                            <button
                                                                className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                                onClick={() => navigate(`/editvendor/${vendor._id}`)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                                onClick={() => console.log(`View vendor ${vendor._id}`)}
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100 text-red-500"
                                                                onClick={() => deleteVendor(vendor._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="m-2 text-gray-500">No vendors found for this business.</p>
                    )}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-end items-center mt-4 space-x-2 p-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 bg-gray-100 rounded hover:bg-gray-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    {/* Pagination Buttons */}
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                        .filter((page) => page <= 3 || page >= totalPages - 1 || (page >= currentPage - 2 && page <= currentPage + 2))
                        .reduce((acc, page, idx, filteredPages) => {
                            if (idx > 0 && page !== filteredPages[idx - 1] + 1) {
                                acc.push('...');
                            }
                            acc.push(page);
                            return acc;
                        }, [])
                        .map((page, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(page)}
                                disabled={page === '...' || page === currentPage}
                                className={`flex items-center justify-center w-10 h-10 ${page === currentPage
                                    ? 'bg-customPrimary text-white'
                                    : page === '...'
                                        ? 'cursor-default'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    } rounded`}
                            >
                                {page}
                            </button>
                        ))}

                    {/* Next Button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center w-10 h-10 bg-gray-100 rounded hover:bg-gray-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    );
};

export default Vendor;