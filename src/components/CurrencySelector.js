import React, { useState, useEffect, useRef } from 'react';
import currencies from 'currencies.json'; // Importing currency data

// Hook for detecting clicks outside the dropdown
const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};

const CurrencySelector = ({ onCurrencyChange }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useOutsideClick(dropdownRef, () => setIsDropdownOpen(false)); // Handle outside clicks

    // Access the currency list correctly based on the structure of the imported currencies
    const currencyList = currencies.currencies || []; // Use an empty array if undefined

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Handle currency selection
    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        setIsDropdownOpen(false);
        onCurrencyChange(currency);
    };

    // Filter currencies based on search query
    const filteredCurrencies = currencyList.filter((currency) =>
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus:outline-2 text-gray-700 cursor-pointer text-[14px]"
                onClick={toggleDropdown}
                role="button"
                aria-expanded={isDropdownOpen}
            >
                <div className="flex items-center justify-between">
                    <span>
                        {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.symbol})` : 'Select a currency'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            {isDropdownOpen && (
                <div className="absolute max-h-60 mt-2 bg-white rounded-lg shadow-lg z-10">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[95%] h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 text-gray-700 text-[14px]"
                        placeholder="Search"
                    />
                    <ul className="max-h-48 overflow-y-auto text-[14px]">
                        {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map((currency, index) => (
                                <li
                                    key={index}
                                    className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCurrencyChange(currency)}
                                >
                                    <span>{`${currency.name} (${currency.symbol})`}</span>
                                </li>
                            ))
                        ) : (
                            <li className="p-3 text-gray-500">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;