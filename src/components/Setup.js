import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import TimezoneSelector from './TimezoneSelector';
import CurrencySelector from './CurrencySelector';
import AddressSelector from './AddressSelector';
import SignOutButton from './SignOutButton';
import LoadingBar from './LoadingBar'; // Import the LoadingBar component
import axios from 'axios';

const Setup = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGstRegistered, setIsGstRegistered] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [states, setStates] = useState([]);
    const [address, setAddress] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
    const [pin, setPin] = useState('');
    const [gstin, setGstin] = useState('');
    const [errors, setErrors] = useState({});
    const hasFetchedData = useRef(false);
    const { user, fetchUser, isLoading } = useUser();
    const navigate = useNavigate(); // Initialize the navigate function

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);


    // Handle checkbox change for GST registration
    const handleGstCheckboxChange = (e) => {
        setIsGstRegistered(e.target.checked);
    };

    // Handle timezone change
    const handleTimezoneChange = (timezone) => {
        setSelectedTimezone(timezone);
    };

    // Handle currency change
    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
    };

    // Handle address, country, state change and update states array
    const handleAddressChange = (country, state, statesArray) => {
        setSelectedCountry(country);
        setSelectedState(state);
        setStates(statesArray); // Update states array
    };


    // Fetch user's timezone, currency, and country on component load
    useEffect(() => {
        const { isSetupCompleted } = user.organization;
    
        if (isSetupCompleted) {
            alert('404 - Page Not Found');
            navigate('/dashboard', { replace: true });
        }
    
        const fetchTimezoneAndCurrency = async () => {
            if (hasFetchedData.current) return; // Check if data has been fetched already
    
            hasFetchedData.current = true; // Set the ref to true to indicate data has been fetched
    
            try {
                const response = await axios.get('https://ipapi.co/json/');
                const { timezone, currency, country } = response.data;
    
                setSelectedCountry(country);
                setSelectedTimezone(timezone);
                setSelectedCurrency(currency);
            } catch (error) {
                alert('Error fetching timezone and currency:', error);
            }
        };
    
        fetchTimezoneAndCurrency();
    }, [navigate, user.organization]); // Add navigate and user.organization to the dependency array    

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!address.trim()) { // Ensure address is not empty
            newErrors.address = "Address is required.";
        }
        if (!selectedCountry) {
            newErrors.country = "Country is required.";
        }

        if (states.length > 0 && !selectedState) {
            newErrors.state = "State is required.";
        }

        if (!pin.trim()) {
            newErrors.pin = "PinCode is required.";
        }
        if (!selectedTimezone) {
            newErrors.timezone = "TimeZone is required.";
        }
        if (!selectedCurrency) {
            newErrors.currency = "Currency is required.";
        }

        if (isGstRegistered && !gstin) {
            newErrors.gstin = "GSTIN is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingProgress(20);
        if (!validateForm()) return;
        setLoadingProgress(50);
        try {
            const response = await axios.post('/api/auth/setup', {
                address,
                country: selectedCountry,
                state: selectedState,
                pin,
                isGst: isGstRegistered,
                gstin: isGstRegistered ? gstin : null,
                timeZone: selectedTimezone,
                dateFormat: 'YYYY-MM-DD', // Set this or take from state if changeable
                currency: selectedCurrency,
            },
                {
                    withCredentials: true, // Include cookies with the request
                });
                setLoadingProgress(80);
            if (response.data.message) {

                await fetchUser();
                setLoadingProgress(100);
                navigate('/select-plan');
            }
        } catch (error) {
            setLoadingProgress(0);
            alert(error.response?.data?.message || '500 - Internal server error.'); // Show error message from the server in an alert
        }
    }

    // Show loading state if data is still being fetched
    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-1 bg-gray-50'>
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}
            <div className='flex text-center md:text-left items-center justify-between w-full'>
                <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                <div className='flex items-center underline mx-1' onClick={toggleDropdown} tabIndex={0} role="button" aria-expanded={isDropdownOpen} onKeyDown={(e) => { if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen); }}>
                    <p className='m-1'>{user?.name}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
                        <ul className="max-h-48 overflow-y-auto w-[120px]">
                            <li className="p-3 hover:bg-gray-100">
                                <SignOutButton />
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <form className='rounded-xl md:shadow p-5 text-left bg-white' onSubmit={handleSubmit}>
                <h1 className='text-center text-[24px] m-2 font-bold'>Complete Business Setup</h1>
                <p className='text-center'>
                    Enter your Organization Details <br /> to complete Setup.
                </p>
                <div className='flex text-left flex-col mt-5'>
                    <h3 className='text-[14px] font-semibold mx-2'>Address</h3>
                    <input type="text" name="address" value={address} onChange={(e) => setAddress(e.target.value)} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Address' />
                    {errors.address && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.address}</span>}
                    <AddressSelector defaultCountry={selectedCountry} selectedState={selectedState} onAddressChange={handleAddressChange} />
                    {errors.country && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.country}</span>}
                    {errors.state && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.state}</span>}
                    <input type="text" name="pin" value={pin} onChange={(e) => setPin(e.target.value)} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Pincode' />
                    {errors.pin && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.pin}</span>}
                    <h3 className='text-[14px] font-semibold mx-2'>Preferences</h3>
                    <TimezoneSelector onTimezoneChange={handleTimezoneChange} selectedTimezone={selectedTimezone} />
                    {errors.timezone && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.timezone}</span>}
                    <CurrencySelector onCurrencyChange={handleCurrencyChange} selectedCurrency={selectedCurrency} />
                    {errors.currency && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.currency}</span>}
                    <h3 className='text-[14px] font-semibold mx-2'>Tax</h3>
                    <div className='flex items-center mx-3 my-2 w-fit'>
                        <input type="checkbox" name="gst" id="gst" className='me-2' checked={isGstRegistered} onChange={handleGstCheckboxChange} />
                        <label htmlFor="gst" className='text-[14px]'>
                            Is your Business GST Registered?
                        </label>
                    </div>

                    {isGstRegistered && (
                        <>
                            <input type="text" name="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='GSTIN' />
                            {errors.gstin && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.gstin}</span>}
                        </>
                    )}
                    {errors.server && <span className='flex max-w-[350px] text-red-500 justify-center text-[14px] mx-2'>{errors.server}</span>} {/* Display server error here */}
                    <div className='flex w-full justify-between'>
                        <button type='submit' className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'>
                            Submit
                        </button>
                    </div>
                </div>
            </form>
            <footer className='my-4 items-center'>
                <p className='text-sm font-thin text-center text-gray-500'>
                    Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
                </p>
            </footer>
        </div>
    );
};

export default Setup;