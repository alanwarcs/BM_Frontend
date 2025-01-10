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
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside ref={sidebarRef} className={`absolute h-screen bg-customPrimary z-50 text-white w-72 p-2 flex-shrink-0 md:block ${isSidebarOpen ? "block" : "hidden"} md:relative`}>

                <div className="flex items-center justify-between mb-6">
                    <div className="text-center md:text-left w-full">
                        <h1 className="text-[38px] mx-5 font-bold">aab.</h1>
                    </div>
                </div>

                <nav>
                    <ul className="text-start">
                        <li className="mb-2">
                            <a href="/" className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gauge mx-2" >
                                    <path d="m12 14 4-4" />
                                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                                </svg>
                                Dashboard
                            </a>
                        </li>

                        {/* Vendor Management */}
                        <li className="mb-2">
                            <button className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover w-full" onClick={() => toggleSubMenu("vendor")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" strokeLinejoin="round" className="lucide lucide-package mx-2"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" /><path d="m7.5 4.27 9 5.15" /></svg>
                                Vendor Management
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${activeMenu === "vendor" ? "rotate-180" : ""}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {activeMenu === "vendor" && (
                                <ul className="pl-8 mt-2">
                                    <li className="mb-2">
                                        <a href="/vendors/list" className="block p-2 rounded-md">
                                            Vendor List
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="/vendors/create" className="block p-2 rounded-md">
                                            Add Vendor
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Customer Management */}
                        <li className="mb-2">
                            <button className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover w-full" onClick={() => toggleSubMenu("customer")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round mx-2">
                                    <path d="M18 20a6 6 0 0 0-12 0" />
                                    <circle cx="12" cy="10" r="4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Customer Management
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`ml-auto transition-transform ${activeMenu === "customer" ? "rotate-180" : ""
                                        }`}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {activeMenu === "customer" && (
                                <ul className="pl-8 mt-2">
                                    <li className="mb-2">
                                        <a href="/vendors/list" className="block p-2 rounded-md">
                                            Customer List
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="/vendors/create" className="block p-2 rounded-md">
                                            Add Customer
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Invoice Management */}
                        <li className="mb-2">
                            <button className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover w-full" onClick={() => toggleSubMenu("invoice")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt mx-2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" /></svg>
                                Invoice Management
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${activeMenu === "invoice" ? "rotate-180" : ""}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {activeMenu === "invoice" && (
                                <ul className="pl-8 mt-2">
                                    <li className="mb-2">
                                        <a href="/vendors/list" className="block p-2 rounded-md">
                                            Invoice List
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="/vendors/create" className="block p-2 rounded-md">
                                            Create New Invoice
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Purchase Order Management */}
                        <li className="mb-2">
                            <button className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover w-full" onClick={() => toggleSubMenu("po")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notebook-tabs mx-2"><path d="M2 6h4" /><path d="M2 10h4" /><path d="M2 14h4" /><path d="M2 18h4" /><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M15 2v20" /><path d="M15 7h5" /><path d="M15 12h5" /><path d="M15 17h5" /></svg>
                                Purchase Order
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${activeMenu === "po" ? "rotate-180" : ""}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {activeMenu === "po" && (
                                <ul className="pl-8 mt-2">
                                    <li className="mb-2">
                                        <a href="/vendors/list" className="block p-2 rounded-md">
                                            Create Purchase Order
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="/vendors/create" className="block p-2 rounded-md">
                                            Manage Purchase Orders
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Stock Management */}
                        <li className="mb-2">
                            <button className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover w-full" onClick={() => toggleSubMenu("stock")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-warehouse mx-2"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><rect width="12" height="12" x="6" y="10" /></svg>
                                Stock Management
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${activeMenu === "stock" ? "rotate-180" : ""}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {activeMenu === "stock" && (
                                <ul className="pl-8 mt-2">
                                    <li className="mb-2">
                                        <a href="/vendors/list" className="block p-2 rounded-md">
                                            Stock List
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="/vendors/create" className="block p-2 rounded-md">
                                            Add Item
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        <li className="mb-2">
                            <a href="/" className="flex items-center p-2 rounded-md hover:bg-customPrimaryHover">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings mx-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>

            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-100">
                {/* Navbar */}
                <header className="bg-white shadow p-4 flex items-center justify-between">
                    <button className="md:hidden text-gray-700 focus:outline-none" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu" >
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </button>
                    <div className="relative">
                    </div>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none cursor-pointer" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                            <div className="flex flex-col items-end">
                                <p className="w-fit text-sm">{user?.organization?.name}</p>
                                <div className="flex items-center">
                                    <p className="w-fit text-xs">{user?.name}</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1735845078210-953081cee65d?q=80&w=2986&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="User Profile"
                                className="w-10 h-10 rounded-full"
                            />
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
                </header>
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;