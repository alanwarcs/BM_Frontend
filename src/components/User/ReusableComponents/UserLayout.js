import React, { useState, useEffect, useRef } from "react";
import { useUser } from '../../../context/userContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserLayout = ({ children }) => {
    const [collapsedState, setCollapsedState] = useState({
        vendor: false,
        customer: false,
        invoice: false,
    });
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const { user, setUser, isLoading } = useUser();

    const navigate = useNavigate();

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside both the button and dropdown
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Automatically open the sidebar on larger screens (md and up)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // Adjust the screen size for 'md' breakpoint
                setSidebarOpen(true); // Open sidebar automatically for large screens
            } else {
                setSidebarOpen(false); // Optionally, you could keep this false for smaller screens
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Check the initial window size on component mount

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    const handleSignOut = async () => {
        try {
            const response = await axios.post('/api/auth/signout', {}, { withCredentials: true });
            if (response.status === 200) {
                localStorage.clear();
                sessionStorage.clear();
                setUser(null);
                navigate('/signin', { replace: true });
            } else {
                throw new Error(response.data.message || 'Unexpected response status');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Sign-out failed. Please try again later.';
            alert({ message: errorMessage, type: 'error' });
        }
    };

    const toggleUserSidebar = () => {
        setSidebarOpen(!isSidebarOpen); // Toggle state
    };

    const toggleSection = (section) => {
        setCollapsedState((prevState) => {
            // Close all other sections except the one that was clicked
            const newState = {
                vendor: false,
                customer: false,
                invoice: false,
            };

            newState[section] = !prevState[section]; // Toggle the clicked section

            return newState;
        });
    };

    // Show loading state if data is still being fetched
    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <div className="flex flex-col h-screen">

            {/* Navbar */}
            <header className="p-2 flex items-center justify-between z-40 shadow">
                <div className="flex">
                    <div className='text-center md:text-left w-full me-2'>
                        <h1 className='text-[28px] mx-2 font-bold'>aab.</h1>
                    </div>
                </div>

                <div className="flex">
                    <div className="flex text-gray-500 me-2">
                        <button href="/" className="flex items-center space-x-2 focus:outline-none cursor-pointer m-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </button>
                        <button href="/" className="flex items-center relative space-x-2 focus:outline-none cursor-pointer m-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></svg>
                            <span className="absolute w-2 h-2 top-0 right-0 rounded-full bg-customPrimary"></span>
                        </button>
                        <button onClick={toggleUserSidebar} className="md:hidden flex items-center relative space-x-2 focus:outline-none cursor-pointer m-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none cursor-pointer" ref={buttonRef} onClick={() => setDropdownOpen(!isDropdownOpen)}>
                            <img
                                src="https://images.unsplash.com/photo-1735845078210-953081cee65d?q=80&w=2986&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="User Profile"
                                className="w-8 h-8 rounded-full"
                            />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 min-w-28 mt-2 bg-white border rounded-md shadow" ref={dropdownRef}>
                                <div className="flex flex-col items-center p-5">
                                    <img
                                        src="https://images.unsplash.com/photo-1735845078210-953081cee65d?q=80&w=2986&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt="User Profile"
                                        className="w-20 h-20 rounded-full"
                                    />
                                    <span className="p-2 text-md">Hi, {user?.name}!</span>
                                </div>
                                <ul className="flex border-t-[1px]">
                                    <li className="p-3 border-e-[1px] hover:bg-gray-100">
                                        <button className="flex items-center justify-center text-sm text-start text-gray-700 hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round me-1"><path d="M18 20a6 6 0 0 0-12 0" /><circle cx="12" cy="10" r="4" /><circle cx="12" cy="12" r="10" /></svg>
                                            <span>Profile</span>
                                        </button>
                                    </li>
                                    <li className="p-3 border-e-[1px] hover:bg-gray-100">
                                        <button className="flex items-center justify-center text-sm text-start text-gray-700 hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings me-1"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                            <span>Settings</span>
                                        </button>
                                    </li>
                                    <li className="p-3 border-e-[1px] hover:bg-gray-100">
                                        <button onClick={handleSignOut} className="flex items-center justify-center text-sm text-start text-gray-700 hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out me-1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                            <span>SignOut</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <div className="flex-1 flex flex-raw bg-white">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? "block" : "hidden"} absolute z-50 md:relative min-w-[260px] h-full p-4 transition-all duration-300 sidebar bg-gray-50 border-r`}>
                    <ul className="overflow-hidden">
                        <li className="m-1">
                            <Link to="/" className="flex items-center justify-center py-3 px-2 rounded-md text-sm bg-customPrimary text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gauge menu-icon me-4"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                                <span className="menu-text">Dashboard</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right menu-text ml-auto"><path d="m9 18 6-6-6-6" /></svg>
                            </Link>
                        </li>

                        {/* Vendor */}
                        <li className="m-1">
                            <div onClick={() => toggleSection('vendor')} className="flex items-center justify-center py-3 px-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package menu-icon me-4"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" /><path d="m7.5 4.27 9 5.15" /></svg>
                                <span className="menu-text">Vendor Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right menu-text ml-auto transform transition-transform duration-300 ${collapsedState.vendor ? 'rotate-90' : 'rotate-0'}`} ><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <div className={`collapse-menu overflow-hidden transition-max-height text-sm text-gray-600 ${collapsedState.vendor ? 'max-h-60' : 'max-h-0'}`}>
                                <ul className="ms-14">
                                    <li className="text-start p-2">
                                        <Link to="/addvendor">
                                            Add New Vendor
                                        </Link>
                                    </li>
                                    <li className="text-start p-2">
                                        <Link to="/vendor">
                                            View/Edit Vendor
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Purchase Order */}
                        <li className="m-1">
                            <div onClick={() => toggleSection('po')} className="flex items-center justify-center py-3 px-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-library-big menu-icon me-4"><rect width="8" height="18" x="3" y="3" rx="1" /><path d="M7 3v18" /><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" /></svg>
                                <span className="menu-text">Purchase Order</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right menu-text ml-auto transform transition-transform duration-300 ${collapsedState.po ? 'rotate-90' : 'rotate-0'}`} ><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <div className={`collapse-menu overflow-hidden transition-max-height text-sm text-gray-600 ${collapsedState.po ? 'max-h-60' : 'max-h-0'}`}>
                                <ul className="ms-14">
                                    <li className="text-start p-2">
                                        <a href="/">
                                            Create Purchase Order
                                        </a>
                                    </li>
                                    <li className="text-start p-2">
                                        <a href="/">
                                            View/Edit Purchase Order
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Customer */}
                        <li className="m-1">
                            <div onClick={() => toggleSection('customer')} className="flex items-center justify-center py-3 px-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round menu-icon me-4"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                                <span className="menu-text">Customer Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right menu-text ml-auto transform transition-transform duration-300 ${collapsedState.customer ? 'rotate-90' : 'rotate-0'}`} ><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <div className={`collapse-menu overflow-hidden transition-max-height text-sm text-gray-600 ${collapsedState.customer ? 'max-h-60' : 'max-h-0'}`}>
                                <ul className="ms-14">
                                    <li className="text-start p-2">
                                        <a href="/">
                                            Add New Customer
                                        </a>
                                    </li>
                                    <li className="text-start p-2">
                                        <a href="/">
                                            View/Edit Customer
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Invoice */}
                        <li className="m-1">
                            <div onClick={() => toggleSection('invoice')} className="flex items-center justify-center py-3 px-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt-text menu-icon me-4"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M14 8H8" /><path d="M16 12H8" /><path d="M13 16H8" /></svg>
                                <span className="menu-text">Invoice Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right menu-text ml-auto transform transition-transform duration-300 ${collapsedState.invoice ? 'rotate-90' : 'rotate-0'}`} ><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <div className={`collapse-menu overflow-hidden transition-max-height text-sm text-gray-600 ${collapsedState.invoice ? 'max-h-60' : 'max-h-0'}`}>
                                <ul className="ms-14">
                                    <li className="text-start p-2">
                                        <a href="/">
                                            Create Invoice
                                        </a>
                                    </li>
                                    <li className="text-start p-2">
                                        <a href="/">
                                            View/Edit Invoice
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Stock */}
                        <li className="m-1">
                            <div onClick={() => toggleSection('stock')} className="flex items-center justify-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-warehouse menu-icon me-4"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><rect width="12" height="12" x="6" y="10" /></svg>
                                <span className="menu-text">Stock Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right menu-text ml-auto transform transition-transform duration-300 ${collapsedState.stock ? 'rotate-90' : 'rotate-0'}`} ><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <div className={`collapse-menu overflow-hidden transition-max-height text-sm text-gray-600 ${collapsedState.stock ? 'max-h-60' : 'max-h-0'}`}>
                                <ul className="ms-14">
                                    <li className="text-start p-2">
                                        <Link to="/additem">
                                            Add New Item
                                        </Link>
                                    </li>
                                    <li className="text-start p-2">
                                        <a href="/">
                                            View/Manage Inventory
                                        </a>
                                    </li>
                                    <li className="text-start p-2">
                                        <Link to="/storage">
                                            Storage
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </aside>
                <main className="h-screen-minus-80 w-full overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;