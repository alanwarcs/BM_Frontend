import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import Alert from '../../Alert';

const Item = () => {
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [alert, setAlert] = useState(null);

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);

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
    };

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
                    <p>Items</p>
                    <div className='flex items-center'>
                        <Link to="/additem" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Add New
                        </Link>

                        <div className='relative p-2 m-1 bg-gray-100 rounded-md text-sm font-light hover:outline-none hover:bg-gray-200 transition'>
                            <button className='flex items-center' onClick={() => setOpenFilterDropdown((prevState) => !prevState)} ref={filterButtonRef} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
                                            />
                                        </div>
                                        <div className="flex flex-col m-2">
                                            <label htmlFor="gstFilter" className="block text-gray-700 text-sm mb-2">
                                                GST Preference
                                            </label>
                                            <input
                                                type="text"
                                                id="Search"
                                                name="search" // Add this
                                                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                                                placeholder="Search"
                                            />
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

                <div className="text-center h-full w-full overflow-scroll">
                </div>
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    )
}

export default Item
