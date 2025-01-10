import React, { useState, useEffect, useRef } from "react";
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserLayout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(""); // Track which menu is open
    const sidebarRef = useRef(null);
    const { user, setUser, isLoading } = useUser();

    const navigate = useNavigate();

    const toggleSubMenu = (menu) => {
        setActiveMenu(activeMenu === menu ? "" : menu);
    };

    // Close sidebar if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            // Call the backend signout route
            const response = await axios.post('/api/auth/signout', {}, { withCredentials: true });

            // Check if the response indicates a successful sign-out
            if (response.status === 200) {
                // Clear any client-side storage or state
                localStorage.clear(); // Clear local storage
                sessionStorage.clear(); // Clear session storage

                // Update the user state to null
                setUser(null);

                // Navigate to the sign-in page
                navigate('/signin', { replace: true });
            } else {
                // Handle unexpected response status
                alert({ message: 'Sign-out failed. Please try again.', type: 'error' });
            }
        } catch (error) {
            // Handle errors during the sign-out process
            const errorMessage = error.response?.data?.message || 'An error occurred during sign-out.';
            alert({ message: errorMessage, type: 'error' });
        }
    };

    // Show loading state if data is still being fetched
    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <div className="flex flex-col h-screen">

            {/* Navbar */}
            <header className="bg-white p-4 flex items-center justify-between z-40 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
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
                    </div>

                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none cursor-pointer" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                            <img
                                src="https://images.unsplash.com/photo-1735845078210-953081cee65d?q=80&w=2986&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="User Profile"
                                className="w-10 h-10 rounded-full"
                            />
                            {/* <div className="flex flex-col items-start">
                                <p className="w-fit text-sm">{user?.organization?.name}</p>
                                <div className="flex items-center">
                                    <p className="w-fit text-xs">{user?.name}</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div> */}
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 min-w-28 w-fit mt-2 bg-white border rounded-md shadow">
                                <ul>
                                    <li className="p-3 hover:bg-gray-100">
                                        <button className="block text-sm text-start text-gray-700 hover:bg-gray-100">
                                            Profile
                                        </button>
                                    </li>
                                    <li className="p-3 hover:bg-gray-100">
                                        <button onClick={handleSignOut} className="block text-sm text-start text-gray-700 hover:bg-gray-100">
                                            SignOut
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <div className="flex-1 flex flex-raw bg-gray-100">
                {/* Sidebar */}
                <aside className="relative min-w-64 h-full bg-white p-4">
                    <ul>
                        <li className="m-1 ">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge me-4"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                                <span>Dashboard</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                        <li className="m-1">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package me-4"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                                <span>Vendor Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                        <li className="m-1">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-big me-4"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></svg>
                                <span>Purchase Order</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                        <li className="m-1">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round me-4"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                                <span>Customer Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                        <li className="m-1">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt-text me-4"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
                                <span>Invoice Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                        <li className="m-1">
                            <a href="#" className="flex items-center p-2 rounded-md text-sm text-gray-600 hover:bg-customPrimary hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-warehouse me-4"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>
                                <span>Stock Management</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-auto"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </li>
                    </ul>
                    <div className="flex absolute items-center justify-end w-10 h-12 top-1/2 right-[-20px] bg-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg>
                    </div>
                </aside>
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;