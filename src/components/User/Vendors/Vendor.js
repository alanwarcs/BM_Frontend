import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import Pagination from '../ReusableComponents/Pagination';
import Alert from '../../Alert';
import axios from 'axios';

const Vendor = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedVendors, setSelectedVendors] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [openFieldDropdown, setOpenFieldDropdown] = useState(false);
    const [selectedFields, setSelectedFields] = useState([]);
    const [appliedFilter, setAppliedFilter] = useState({});
    const [filter, setFilter] = useState({
        search: '',
        gstRegistered: '',
    });

    const fieldOptions = ['Organization Name', 'Primary Person Name', 'Email', 'Phone', 'Shipping Address', 'Billing Address', 'GSTIN', 'Source State', 'PAN Number']; // Available fields

    const navigate = useNavigate();

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);
    const printButtonRef = useRef(null);
    const fieldDropDownRef = useRef(null);
    const editorRef = useRef(null);
    const editorButtonRef = useRef(null);

    // Fetch all vendor's or based on Filter and search
    const fetchVendors = useCallback(async (page = 1) => {
        try {
            setLoadingProgress(30);

            const params = {
                page,
                limit: 13,
                ...appliedFilter,
            };

            const response = await axios.get('/api/vendor/vendors', { params });
            setLoadingProgress(70);

            if (response.data.success) {
                setVendors(response.data.data.vendors || []);
                setCurrentPage(page);
                setTotalPages(response.data.data.pagination?.totalPages || 1);
            } else {
                setAlert({ message: response.data.message || 'Unexpected error occurred.', type: 'error' });
            }
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error fetching vendors. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    }, [appliedFilter]);

    //Handle Click Outside Ref
    const handleClickOutside = (event) => {
        // Close filter dropdown if clicking outside
        if (
            filterRef.current &&
            !filterRef.current.contains(event.target) &&
            filterButtonRef.current &&
            !filterButtonRef.current.contains(event.target)
        ) {
            setOpenFilterDropdown(false);
        }

        // Close field dropdown if clicking outside
        if (
            fieldDropDownRef.current &&
            !fieldDropDownRef.current.contains(event.target) &&
            printButtonRef.current &&
            !printButtonRef.current.contains(event.target)
        ) {
            setOpenFieldDropdown(false);
        }

        // Close edit dropdown if clicking outside
        if (
            editorRef.current &&
            !editorRef.current.contains(event.target) &&
            editorButtonRef.current &&
            !editorButtonRef.current.contains(event.target)
        ) {
            setOpenDropdown(null);  // Corrected usage of setter function
        }
    };

    // Fetch data on component mount and when filters or currentPage change
    useEffect(() => {
        fetchVendors(currentPage);
    }, [fetchVendors, currentPage]);

    //Handle Click Outside Ref (Effect)
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function to delete all vendor
    const deleteVendor = async (vendorId) => {
        try {
            setLoadingProgress(30);
            const response = await axios.delete(`/api/vendor/vendors/${vendorId}`);
            setLoadingProgress(70);

            if (response.data.success) {
                setAlert({ message: 'Vendor deleted successfully!', type: 'success' });
                fetchVendors(currentPage);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error deleting vendor. Please try again.', type: 'error' });
        }
    };

    // Function to delete selected vendors
    const deleteSelectedVendors = async () => {
        try {
            const selectedIds = Object.keys(selectedVendors).filter(
                (vendorId) => selectedVendors[vendorId]
            );

            if (selectedIds.length === 0) {
                setAlert({ message: 'No vendors selected for deletion.', type: 'warning' });
                return;
            }

            const isConfirmed = window.confirm("Are you sure you want to delete the selected vendors?");
            if (!isConfirmed) {
                return;
            }

            setLoadingProgress(30);

            const deletePromises = selectedIds.map((vendorId) =>
                axios.delete(`/api/vendor/vendors/${vendorId}`)
            );

            await Promise.all(deletePromises);

            setAlert({ message: 'Selected vendors deleted successfully!', type: 'success' });
            fetchVendors(currentPage);
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error deleting selected vendors. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    };

    // Function to Print selected vendors List
    const handlePrintSelectedVendors = async (selectedVendors, selectedFields) => {
        try {
            const response = await axios.post('/api/vendor/printList', {
                selectedVendors: selectedVendors,
                selectedFields: selectedFields
            });

            const printWindow = window.open('', '', 'width=800,height=600');

            printWindow.document.write(response.data);
            printWindow.document.close();

            printWindow.print();

        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error printing vendor. Please try again.', type: 'error' });
        }
    };

    const handlePrintSubmit = (e) => {
        e.preventDefault();
        handlePrintSelectedVendors(selectedVendors, selectedFields);
    };

    //If User made changers on Filter Set Filter
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    //Apply Filters and set all filter to applyFilter and fatch data
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setAppliedFilter(filter);
        setCurrentPage(1);
    };

    //Toggel pritn dropdown to select fields to print
    const togglePrintDropdown = () => {
        setOpenFieldDropdown((prev) => !prev);
    };

    //Set select fields to print
    const handleFieldSelect = (field) => {
        setSelectedFields((prev) =>
            prev.includes(field) ? prev.filter((item) => item !== field) : [...prev, field]
        );
    };

    //Handle page change in Pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}

            <div className="flex flex-col relative h-full w-full text-start">

                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Vendors</p>
                    <div className='flex items-center'>
                        <Link to="/addVendor" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Add New
                        </Link>

                        <div className='relative p-2 m-1 bg-gray-100 rounded-md text-sm font-light hover:outline-none hover:bg-gray-200 transition'>
                            <button onClick={() => setOpenFilterDropdown((prevState) => !prevState)} className='flex items-center' ref={filterButtonRef}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </button>
                            {openFilterDropdown && (
                                <form
                                    onSubmit={handleApplyFilters}
                                    className="absolute top-12 right-0 mt-2 p-4 z-10 bg-white border border-gray-200 rounded-lg shadow-lg"
                                    ref={filterRef}
                                >
                                    <div className="flex items-end gap-4">
                                        {/* Search Input */}
                                        <div className="flex flex-col">
                                            <label htmlFor="Search" className="block text-gray-700 text-sm font-medium mb-1">
                                                Search
                                            </label>
                                            <input
                                                type="text"
                                                id="Search"
                                                name="search"
                                                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                                placeholder="Search"
                                                value={filter.search}
                                                onChange={handleFilterChange}
                                            />
                                        </div>

                                        {/* GST Filter Dropdown */}
                                        <div className="flex flex-col">
                                            <label htmlFor="gstFilter" className="block text-gray-700 text-sm font-medium mb-1">
                                                GST Preference
                                            </label>
                                            <select
                                                id="gstFilter"
                                                name="gstRegistered"
                                                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                                value={filter.gstRegistered}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="" disabled>Select</option>
                                                <option value="gstRegistered">GST Registered</option>
                                                <option value="unregistered">Unregistered</option>
                                            </select>
                                        </div>

                                        {/* Apply Button */}
                                        <button
                                            type="submit"
                                            className="h-10 px-4 rounded-lg bg-customPrimary hover:bg-customPrimaryHover text-white text-sm font-medium transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {selectedVendors && (
                            <div className="flex items-center gap-2">
                                {Object.values(selectedVendors).some((isSelected) => isSelected) && (
                                    <div className="flex items-center gap-1">
                                        {/* Print Button and Dropdown */}
                                        <div className="relative" ref={printButtonRef}>
                                            <button
                                                onClick={togglePrintDropdown}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="stroke-current"
                                                >
                                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                                    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                                                    <rect x="6" y="14" width="12" height="8" rx="1" />
                                                </svg>
                                            </button>

                                            {openFieldDropdown && (
                                                <form
                                                    ref={fieldDropDownRef}
                                                    className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-64 overflow-hidden"
                                                    onSubmit={handlePrintSubmit}
                                                >
                                                    <div className="max-h-64 overflow-y-auto p-2">
                                                        {fieldOptions.map((field) => (
                                                            <label
                                                                key={field}
                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFields.includes(field)}
                                                                    onChange={() => handleFieldSelect(field)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm font-medium text-gray-700">{field}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-100 p-2">
                                                        <button
                                                            type="submit"
                                                            className="w-full py-2 px-4 bg-customPrimary text-white text-sm font-medium rounded-md transition-colors duration-200"
                                                        >
                                                            Apply Selection
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={deleteSelectedVendors}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600 hover:text-red-700"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="stroke-current"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                <line x1="14" x2="14" y1="11" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr />

                <div className="text-center h-full w-full overflow-scroll">
                    {vendors.length > 0 ? (
                        <div className="relative w-full h-full overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-sm text-left rtl:text-right">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">
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
                                        <th className="px-6 py-2">Name</th>
                                        <th className="px-6 py-2">Company Name</th>
                                        <th className="px-6 py-2">Email</th>
                                        <th className="px-6 py-2">Phone</th>
                                        <th className="px-6 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map((vendor) => (
                                        <tr key={vendor._id} className="bg-white border-b">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setSelectedVendors((prev) => ({
                                                        ...prev,
                                                        [vendor._id]: !prev[vendor._id],
                                                    }))}
                                                    checked={!!selectedVendors[vendor._id]}
                                                />
                                            </td>
                                            <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {vendor.primaryPerson || '-'}
                                            </td>
                                            <td className="px-6 py-2">
                                                {vendor.vendorOrganizationName || '-'}
                                            </td>
                                            <td className="px-6 py-2">{vendor.emailAddress || '-'}</td>
                                            <td className="px-6 py-2">{vendor.phone || '-'}</td>
                                            <td className="relative px-6 py-2">
                                                <button
                                                    ref={editorButtonRef}
                                                    className="text-gray-600 focus:outline-none"
                                                    onClick={() =>
                                                        setOpenDropdown((prev) => (prev === vendor._id ? null : vendor._id))
                                                    }
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical" >
                                                        <circle cx="12" cy="12" r="1" />
                                                        <circle cx="12" cy="5" r="1" />
                                                        <circle cx="12" cy="19" r="1" />
                                                    </svg>
                                                </button>
                                                {openDropdown === vendor._id && (
                                                    <div ref={editorRef} className="absolute right-5 top-0 z-20 mt-2 bg-white border border-gray-300 rounded shadow-lg w-24 overflow-hidden">
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/editvendor/${vendor._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/vendor/${vendor._id}`)}
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <p className="m-2 text-gray-400">No vendors found for this business.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    );
};

export default Vendor;