import React, { useState } from 'react';
import ContrySelector from './ContrySelector';
import TimezoneSelector from './TimezoneSelector';
import CurrencySelector from './CurrencySelector';

const Setup = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown toggle
    const [isGstRegistered, setIsGstRegistered] = useState(false); // GST Registered state
    const [selectedTimezone, setSelectedTimezone] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleGstCheckboxChange = (e) => {
        setIsGstRegistered(e.target.checked);
    };

    const handleTimezoneChange = (timezone) => {
        setSelectedTimezone(timezone);
        console.log('Selected Timezone:', timezone);
    };

    const handleCurrencyChange = (currency) => {
        console.log('Selected currency:', currency);
        setSelectedCurrency(currency);
    };
    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-3'>
            <div className='flex text-center md:text-left items-center justify-between w-full'>
                <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>

                <div className='flex items-center underline' onClick={toggleDropdown} role="button" aria-expanded={isDropdownOpen}>
                    <p className='m-1'>Murtaza Patel</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow-lg z-10 text-center'>
                        <ul className="w-[100px] max-h-48 overflow-y-auto">
                            <li className="p-3 text-gray-500">
                                <a href="/">Logout</a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <form className='rounded-xl shadow p-5 text-left'>
                <h1 className='text-center text-[24px] m-2 font-bold'>Complete Business Setup</h1>
                <p className='text-center'>
                    Enter your Business/Organization Details <br />to complete Setup.
                </p>
                <div className='flex text-left flex-col mt-5'>
                    <input type="text" name="address" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Address' />
                    <ContrySelector />
                    <input type="text" name="pincode" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Pincode' />
                    <TimezoneSelector onTimezoneChange={handleTimezoneChange} />
                    <CurrencySelector onCurrencyChange={handleCurrencyChange} />
                    <div className='flex items-center mx-3 my-2 w-fit'>
                        <input type="checkbox" name="gst" id="gst" className='me-2' checked={isGstRegistered} onChange={handleGstCheckboxChange} />
                        <label htmlFor="gst" className='text-[14px]'>
                            Is your Business GST Registered?
                        </label>
                    </div>

                    {/* Conditionally render GSTIN input if the user checks the GST Registered checkbox */}
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