import React, { useState, useEffect, useRef } from 'react';
import TimezoneSelector from './TimezoneSelector';
import CurrencySelector from './CurrencySelector';
import axios from 'axios';
import AddressSelector from './AddressSelector';

const Setup = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGstRegistered, setIsGstRegistered] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const hasFetchedData = useRef(false); // Ref to track fetch status


    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleGstCheckboxChange = (e) => {
        setIsGstRegistered(e.target.checked);
    };

    const handleTimezoneChange = (timezone) => {
        setSelectedTimezone(timezone);
    };

    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
    };

    const handleAddressChange = (country, State) => {
        setSelectedCountry(country);
        setSelectedState(State);
    };

    // Fetch user's timezone on component load
    useEffect(() => {
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
                console.error('Error fetching timezone and currency:', error);
            }
        };
    
        fetchTimezoneAndCurrency();
    }, []);

    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-1'>
            <div className='flex text-center md:text-left items-center justify-between w-full'>
                <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                <div className='flex items-center underline mx-1' onClick={toggleDropdown} role="button" aria-expanded={isDropdownOpen}>
                    <p className='m-1'>Murtaza Patel</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
                        <ul className="max-h-48 overflow-y-auto w-[120px]">
                            <li className="p-3 hover:bg-gray-100">
                                <a href="/">Logout</a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <form className='rounded-xl md:shadow p-5 text-left'>
                <h1 className='text-center text-[24px] m-2 font-bold'>Complete Business Setup</h1>
                <p className='text-center'>
                    Enter your Organization Details <br/> to complete Setup.
                </p>
                <div className='flex text-left flex-col mt-5'>
                    <h3 className='text-[14px] font-semibold mx-2'>Address</h3>
                    <input type="text" name="address" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Address' />
                    <AddressSelector defaultCountry={selectedCountry} selectedState={selectedState} onAddressChange={handleAddressChange} />
                    <input type="text" name="pincode" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Pincode' />
                    <h3 className='text-[14px] font-semibold mx-2'>Preferences</h3>
                    <TimezoneSelector onTimezoneChange={handleTimezoneChange} selectedTimezone={selectedTimezone} />
                    <CurrencySelector onCurrencyChange={handleCurrencyChange} selectedCurrency={selectedCurrency}/>
                    <h3 className='text-[14px] font-semibold mx-2'>Tax</h3>
                    <div className='flex items-center mx-3 my-2 w-fit'>
                        <input type="checkbox" name="gst" id="gst" className='me-2' checked={isGstRegistered} onChange={handleGstCheckboxChange} />
                        <label htmlFor="gst" className='text-[14px]'>
                            Is your Business GST Registered?
                        </label>
                    </div>

                    {isGstRegistered && (
                        <input type="text" name="gstin" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='GSTIN' />
                    )}
                    <div className='flex w-full justify-between'>
                        <button className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'>
                            Next
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