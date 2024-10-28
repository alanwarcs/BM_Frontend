import React, { useState, useEffect, useRef } from 'react';
import Flag from 'react-world-flags';
import { Country } from 'country-state-city';

const PhoneCodeSelector = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCodes, setCountryCodes] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0); // For keyboard navigation
  const dropdownRef = useRef(null);

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

  useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

  // Fetch country codes from the react-country-state-city package
  useEffect(() => {
    const countries = Country.getAllCountries();
    const formattedCountries = countries.map((country) => ({
      code: country.phonecode.startsWith('+') ? country.phonecode : `+${country.phonecode}`, // Ensure code starts with '+'
      name: country.name,
      isoCode: country.isoCode.toLowerCase(), // Store isoCode for flag rendering
    }));
    setCountryCodes(formattedCountries); // Set the country codes state
    setSelectedCountryCode(formattedCountries[0]); // Set the initial selected country
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle country code selection
  const handleCountryCodeChange = (country) => {
    setSelectedCountryCode(country);
    setIsDropdownOpen(false);
    setHighlightedIndex(0); // Reset highlighted index when dropdown is closed
  };

  // Handle phone number input
  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  // Filter country codes based on search query
  const filteredCountries = countryCodes.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex < filteredCountries.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredCountries.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (isDropdownOpen && filteredCountries.length > 0) {
          handleCountryCodeChange(filteredCountries[highlightedIndex]);
        } else {
          setIsDropdownOpen(true);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="flex relative items-center w-[300px] md:w-[350px] m-2 rounded-lg outline outline-1 outline-customSecondary focus-within:outline-2 focus-within:outline-customSecondary phone-code-dropdown"
      ref={dropdownRef}
    >
      {/* Country Code Dropdown */}
      <div
        onClick={toggleDropdown}
        className="flex w-[150px] py-3 px-2 items-center justify-between outline-none text-[14px] cursor-pointer"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <span className="px-2 flex items-center">
          <Flag code={selectedCountryCode?.isoCode} className="w-6 h-4 mr-2" />
          {selectedCountryCode?.code}
        </span>
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
          className="lucide lucide-chevron-down"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className="flex absolute flex-col top-12 rounded-lg shadow bg-white w-[250px] max-h-[200px] z-10" onKeyDown={handleKeyDown}>
          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
            placeholder="Search"
          />

          {/* Country Code List */}
          <ul className="max-h-40 overflow-y-auto text-[14px]">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <li
                  key={index}
                  onClick={() => handleCountryCodeChange(country)}
                  className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    highlightedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <Flag code={country.isoCode} className="w-6 h-4 mr-2" />
                  {country.code} {country.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}

      {/* Phone Number Input */}
      <input
        type="text"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="block w-full py-3 px-2 ml-2 outline-none text-[14px]"
        placeholder="Enter phone number"
      />
    </div>
  );
};

export default PhoneCodeSelector;