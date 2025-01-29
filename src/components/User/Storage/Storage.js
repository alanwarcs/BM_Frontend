import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
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
    const [selectedrStorage, setSelectedStorage] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [openFieldDropdown, setOpenFieldDropdown] = useState(false);
    const [selectedFields, setSelectedFields] = useState([]);
    const [appliedFilter, setAppliedFilter] = useState({});
    const [filter, setFilter] = useState({
        search: '',
        storageType: '',
    });

    const navigate = useNavigate();

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);
    const printButtonRef = useRef(null);
    const fieldDropDownRef = useRef(null);

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
    console.log(storage);
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </button>
                            {openFilterDropdown && (
                                <form className='flex absolute items-end top-10 right-0 mt-2 p-2 z-10 bg-white border rounded-md shadow' ref={filterRef}>
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

                    </div>
                </div>

                <hr />
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    )
}

export default Storage
