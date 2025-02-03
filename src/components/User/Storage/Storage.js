import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
import TextInput from "../ReusableComponents/TextInput";
import SelectInput from "../ReusableComponents/SelectInput";
import LoadingBar from '../../LoadingBar';
import Pagination from '../ReusableComponents/Pagination';
import Alert from '../../Alert';
import axios from 'axios';

const Storage = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);
    const [storage, setStorage] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStorage, setSelectedStorage] = useState({});
    const [selectedStorageToView, setSelectedStorageToView] = useState();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState({});
    const [filter, setFilter] = useState({
        search: '',
        storageType: '',
    });

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);
    const editorRef = useRef(null);
    const editorButtonRef = useRef(null);

    // Fetch all Storage's or based on Filter and search
    const fetchStorage = useCallback(async (page = 1) => {
        try {
            setLoadingProgress(30);

            const params = {
                page,
                limit: 13,
                ...appliedFilter,
            };

            const response = await axios.get('/api/storage/', { params });
            setLoadingProgress(70);

            if (response.data.success) {
                setStorage(response.data.data.storage || []);
                setCurrentPage(page);
                setTotalPages(response.data.data.pagination?.totalPages || 1);
            } else {
                setAlert({ message: response.data.message || 'Unexpected error occurred.', type: 'error' });
            }
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error fetching storage. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    }, [appliedFilter]);

    // Updated handleClickOutside
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

    // Fetch data on component mount and when filters or currentPage change
    useEffect(() => {
        fetchStorage(currentPage);
    }, [fetchStorage, currentPage]);

    //Handle Click Outside Ref (Effect)
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    //Handle page change in Pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Function to delete all storage
    const deleteStorage = async (storageId) => {
        try {
            setLoadingProgress(30);
            const response = await axios.delete(`/api/storage/deleteStorage/${storageId}`);
            setLoadingProgress(70);

            if (response.data.success) {
                setAlert({ message: 'storage deleted successfully!', type: 'success' });
                fetchStorage(currentPage);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error deleting storage. Please try again.', type: 'error' });
        }
    };

    // Function to delete selected Storage
    const deleteSelectedStorage = async () => {
        try {
            const selectedIds = Object.keys(selectedStorage).filter(
                (storageId) => selectedStorage[storageId]
            );

            if (selectedIds.length === 0) {
                setAlert({ message: 'No storage selected for deletion.', type: 'warning' });
                return;
            }

            const isConfirmed = window.confirm("Are you sure you want to delete the selected storage?");
            if (!isConfirmed) {
                return;
            }

            setLoadingProgress(30);

            const deletePromises = selectedIds.map((storageId) =>
                axios.delete(`/api/storage/deleteStorage/${storageId}`)
            );

            await Promise.all(deletePromises);

            setAlert({ message: 'Selected storage deleted successfully!', type: 'success' });
            fetchStorage(currentPage);
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error deleting selected storage. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    };

    // Validate Form Fields
    const validateForm = () => {
        if (!selectedStorageToView?.storageType) {
            setAlert({
                message: 'Storage Type is required.',
                type: 'error',
            });
            return false;
        }

        if (!selectedStorageToView?.storageName) {
            setAlert({
                message: 'Storage Name is required.',
                type: 'error',
            });
            return false;
        }

        if (selectedStorageToView?.capacity && (isNaN(selectedStorageToView?.capacity) || selectedStorageToView?.capacity <= 0)) {
            setAlert({
                message: 'Capacity must be a positive number.',
                type: 'error',
            });
            return false;
        }

        if (selectedStorageToView?.capacity && !selectedStorageToView?.capacityUnit) {
            setAlert({
                message: 'Capacity Unit is required if capacity is provided.',
                type: 'error',
            });
            return false;
        }

        return true;
    };

    // Function to Update selected Storage
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setLoadingProgress(30);
        if (!validateForm()) {
            setLoadingProgress(0);
            return;
        }
        setLoadingProgress(50);
        try {
            if (!selectedStorageToView?._id) {
                setAlert({ message: "Storage ID is missing.", type: "error" });
                return;
            }

            const response = await axios.put(
                `/api/storage/updateStorage/${selectedStorageToView._id}`, // API endpoint
                selectedStorageToView // Data to be updated
            );

            if (response.data.success) {
                setAlert({ message: "Storage updated successfully!", type: "success" });
                setSelectedStorageToView(null); // Close the modal after successful update

                // Refetch the storage list upon successful update
                fetchStorage(currentPage); // Pass the current page to keep the pagination intact
            } else {
                setAlert({ message: "Failed to update storage.", type: "error" });
            }
        } catch (error) {
            console.error('Error updating storage:', error);
            setAlert({ message: "An error occurred while updating storage.", type: "error" });
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}
            <div className="flex flex-col relative h-full w-full text-start">

                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Storage</p>
                    <div className='flex items-center'>
                        <Link to="/addStorage" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Add New
                        </Link>

                        <div className='relative p-2 m-1 bg-gray-100 rounded-md text-sm font-light hover:outline-none hover:bg-gray-200 transition'>
                            <button onClick={() => setOpenFilterDropdown((prevState) => !prevState)} className='flex items-center' ref={filterButtonRef}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </button>
                            {openFilterDropdown && (
                                <form onSubmit={handleApplyFilters} className='flex absolute items-end top-10 right-0 mt-2 p-2 z-10 bg-white border rounded-md shadow' ref={filterRef}>
                                    <div className='flex items-end'>
                                        <div className="flex flex-col m-2">
                                            <label htmlFor="Search" className="block text-gray-700 text-sm mb-2">
                                                Search
                                            </label>
                                            <input
                                                type="text"
                                                id="Search"
                                                name="search" // Add this
                                                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                                placeholder="Search"
                                                value={filter.search}
                                                onChange={handleFilterChange}
                                            />
                                        </div>
                                        <div className="flex flex-col m-2">
                                            <label htmlFor="gstFilter" className="block text-gray-700 text-sm mb-2">
                                                Storage Type
                                            </label>
                                            <select
                                                id="storageType"
                                                name="storageType" // Add this
                                                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                                value={filter.storageType}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="" disabled>Select</option>
                                                <option value="warehouse">Warehouse</option>
                                                <option value="cold storage">Cold Storage</option>
                                                <option value="retail store">Retail Store</option>
                                                <option value="distribution center">Distribution Center</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <button type="submit" className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 p-2 text-white text-sm'>
                                            Apply
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {selectedStorage && (
                            <div className="flex flex-cols items-center">
                                {Object.values(selectedStorage).some((isSelected) => isSelected) && (
                                    <div className='flex flex-cols items-center'>
                                        <button onClick={deleteSelectedStorage} className='flex items-center relative m-1 rounded-md text-red-500 text-sm font-light hover:outline-none transition'>
                                            <div className='flex items-center p-2'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                <hr />

                <div className="text-center h-full w-full overflow-scroll">
                    {storage.length > 0 ? (
                        <div className="relative w-full h-full overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-sm text-left rtl:text-right capitalize">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const allSelected = storage.reduce((acc, storage) => {
                                                        acc[storage._id] = checked;
                                                        return acc;
                                                    }, {});
                                                    setSelectedStorage(allSelected);
                                                }}
                                                checked={storage.every((storage) => selectedStorage[storage._id])}
                                            />
                                        </th>
                                        <th className="px-6 py-2">Storage Name</th>
                                        <th className="px-6 py-2">Storage Type</th>
                                        <th className="px-6 py-2">Address</th>
                                        <th className="px-6 py-2">Capicity</th>
                                        <th className="px-6 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {storage.map((storage) => (
                                        <tr key={storage._id} className="bg-white border-b">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setSelectedStorage((prev) => ({
                                                        ...prev,
                                                        [storage._id]: !prev[storage._id],
                                                    }))}
                                                    checked={!!selectedStorage[storage._id]}
                                                />
                                            </td>
                                            <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {storage.storageName || '-'}
                                            </td>
                                            <td className="px-6 py-2">
                                                {storage.storageType || '-'}
                                            </td>
                                            <td className="px-6 py-2">{storage.storageAddress || '-'}</td>
                                            <td className="px-6 py-2">
                                                {storage.capacity ? `${storage.capacity} ${storage.capacityUnit}` : '-'}
                                            </td>

                                            <td className="relative px-6 py-2">
                                                <button
                                                    ref={editorButtonRef}
                                                    className="text-gray-600 focus:outline-none"
                                                    onClick={() =>
                                                        setOpenDropdown((prev) => (prev === storage._id ? null : storage._id))
                                                    }
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical" >
                                                        <circle cx="12" cy="12" r="1" />
                                                        <circle cx="12" cy="5" r="1" />
                                                        <circle cx="12" cy="19" r="1" />
                                                    </svg>
                                                </button>
                                                {openDropdown === storage._id && (
                                                    <div ref={editorRef} className="absolute right-5 top-0 z-20 mt-2 bg-white border border-gray-300 rounded shadow-lg w-24">
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => setSelectedStorageToView(storage)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100 text-red-500"
                                                            onClick={() => deleteStorage(storage._id)}
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
                            <p className="m-2 text-gray-400">No Storage found for this business.</p>
                        </div>
                    )}
                </div>

                {selectedStorageToView && (
                    <div className='flex absolute items-center justify-center w-full h-full bg-black bg-opacity-50 z-20'>
                        <div className='bg-white rounded-md m-1 p-4'>
                            <div className='flex items-center justify-between w-full'>
                                <p className='text-xl font-medium'>Edit Storage</p>
                                <button onClick={() => setSelectedStorageToView(null)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateSubmit} className='block w-fit'>
                                <div className='flex flex-col md:flex-row w-fit'>
                                    <SelectInput
                                        id="storageType"
                                        label="Storage Type"
                                        required
                                        value={selectedStorageToView?.storageType || ''}
                                        options={[
                                            { value: "warehouse", label: "Warehouse" },
                                            { value: "cold storage", label: "Cold Storage" },
                                            { value: "retail store", label: "Retail Store" },
                                            { value: "distribution center", label: "Distribution Center" },
                                            { value: "other", label: "Other" },
                                        ]}
                                        onChange={(e) => setSelectedStorageToView({ ...selectedStorageToView, storageType: e.target.value })}
                                    />
                                    <TextInput
                                        label="Storage Name"
                                        id="storageName"
                                        placeholder="Enter storage name"
                                        required
                                        value={selectedStorageToView?.storageName || ''}
                                        onChange={(e) => setSelectedStorageToView({ ...selectedStorageToView, storageName: e.target.value })}
                                    />
                                </div>

                                <div className='flex flex-col md:flex-row w-fit'>
                                    <TextInput
                                        label="Capacity"
                                        id="capacity"
                                        placeholder="Enter capacity"
                                        type="number"
                                        value={selectedStorageToView?.capacity || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSelectedStorageToView({
                                                ...selectedStorageToView,
                                                capacity: value,
                                                // Clear capacityUnit if capacity is empty or 0
                                                capacityUnit: value ? selectedStorageToView.capacityUnit : null,
                                            });
                                        }}
                                    />
                                    <SelectInput
                                        id="capacityUnit"
                                        label="Capacity Unit"
                                        required={!!selectedStorageToView?.capacity}
                                        value={selectedStorageToView?.capacityUnit || ''}
                                        disabled={!selectedStorageToView?.capacity}  // Disable if capacity is empty or 0
                                        options={[
                                            { value: "units", label: "Units" },
                                            { value: "kg", label: "Kilograms" },
                                            { value: "liters", label: "Liters" },
                                            { value: "cubic meters", label: "Cubic Meters" },
                                        ]}
                                        onChange={(e) => setSelectedStorageToView({ ...selectedStorageToView, capacityUnit: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col m-2 w-fit">
                                    <label htmlFor="storageAddress" className="block text-gray-700 text-sm mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        id="storageAddress"
                                        className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                                        rows="4"
                                        placeholder="Enter storage address"
                                        value={selectedStorageToView?.storageAddress || ''}
                                        onChange={(e) => setSelectedStorageToView({ ...selectedStorageToView, storageAddress: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    )
}

export default Storage
