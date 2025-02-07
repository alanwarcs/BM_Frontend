import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const CurrencySelector = ({ onCurrencyChange, selectedCurrency }) => {
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);


    // Detect outside click to close dropdown
    useOutsideClick(dropdownRef, () => setIsDropdownOpen(false)); // Handle outside clicks

    // Memoize the currency list to avoid unnecessary recalculations
    const currencyList = useMemo(() => currencies.currencies || [], []); // Empty array as dependency

    // Effect hook to set the current selected currency on load
    useEffect(() => {
        if (selectedCurrency) {
            const currency = currencyList.find(c => c.code === selectedCurrency);
            if (currency) {
                setCurrentCurrency(currency);
                onCurrencyChange(currency.code); // Notify parent component
            }
        }
    }, [selectedCurrency, currencyList, onCurrencyChange]);

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Handle currency selection
    const handleCurrencyChange = (currency) => {
        setCurrentCurrency(currency);
        setIsDropdownOpen(false);
        onCurrencyChange(currency.code);
    };

    // Filter currencies based on search query
    const filteredCurrencies = currencyList.filter((currency) =>
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle keyboard navigation for currency selection
    const handleKeyDown = (e) => {
        if (!isDropdownOpen) return;

        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === filteredCurrencies.length - 1 ? 0 : prevIndex + 1
            );
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === 0 ? filteredCurrencies.length - 1 : prevIndex - 1
            );
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            handleCurrencyChange(filteredCurrencies[highlightedIndex]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <div
                className="py-3 px-4 m-2 rounded-lg outline outline-1 font-[14px] outline-customSecondary focus:outline-2 text-gray-700 cursor-pointer text-[14px]"
                onClick={toggleDropdown}
                role="button"
                aria-expanded={isDropdownOpen}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen);
                }}
            >
                <div className="flex items-center justify-between">
                    <span>
                        {currentCurrency ? `${currentCurrency.name} (${currentCurrency.symbol})` : 'Select a currency'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            {isDropdownOpen && (
                <div className="absolute max-h-60 min-w-[250px] mt-2 bg-white rounded-lg shadow z-10">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setHighlightedIndex(-1);
                        }}
                        className="w-[95%] h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 text-gray-700 text-[14px]"
                        placeholder="Search"
                    />
                    <ul className="max-h-40 overflow-y-auto text-[14px]">
                        {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map((currency, index) => (
                                <li
                                    key={index}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                                        index === highlightedIndex ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleCurrencyChange(currency)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
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