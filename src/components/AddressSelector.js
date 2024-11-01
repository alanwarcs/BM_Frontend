import React, { useState, useEffect, useRef } from 'react';
import Flag from 'react-world-flags';
import { Country, State } from 'country-state-city';

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

const AddressSelector = ({ onAddressChange }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [stateSearchQuery, setStateSearchQuery] = useState('');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
    const [highlightedCountryIndex, setHighlightedCountryIndex] = useState(-1);
    const [highlightedStateIndex, setHighlightedStateIndex] = useState(-1);
    const countryDropdownRef = useRef(null);
    const stateDropdownRef = useRef(null);

    useOutsideClick(countryDropdownRef, () => setIsCountryDropdownOpen(false));
    useOutsideClick(stateDropdownRef, () => setIsStateDropdownOpen(false));

    useEffect(() => {
        const countriesData = Country.getAllCountries();
        const formattedCountries = countriesData.map((country) => ({
            name: country.name,
            isoCode: country.isoCode.toLowerCase(),
            code: country.isoCode,
        }));
        setCountries(formattedCountries);
    }, []);

    useEffect(() => {
        // Fetch country based on IP only if no country is selected
        const getCountryFromIP = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const userCountryCode = data.country.toLowerCase();

                // Match the country with the list of countries
                const country = countries.find(c => c.isoCode === userCountryCode);
                if (country) {
                    setSelectedCountry(country);
                    const countryStates = State.getStatesOfCountry(country.code);
                    setStates(countryStates);
                    onAddressChange(country, null, countryStates); // Notify parent component
                }
            } catch (error) {
                console.error("Failed to fetch country from IP:", error);
            }
        };

        // Only fetch country from IP if no country is already selected
        if (!selectedCountry) {
            getCountryFromIP();
        }
    }, [countries, selectedCountry, onAddressChange]);

    const toggleCountryDropdown = () => setIsCountryDropdownOpen(!isCountryDropdownOpen);
    const toggleStateDropdown = () => setIsStateDropdownOpen(!isStateDropdownOpen);

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        const countryStates = State.getStatesOfCountry(country.code); // Fetch states based on selected country
        setStates(countryStates);
        setSelectedState(null); // Reset state selection
        onAddressChange(country.name, null,countryStates); // Notify parent about the selected country
        setIsCountryDropdownOpen(false);
    };

    const handleStateChange = (state) => {
        setSelectedState(state);
        onAddressChange(selectedCountry.name, state.name,states); // Notify parent about the selected state
        setIsStateDropdownOpen(false);
    };

    const handleKeyDown = (e, type) => {
        if (type === 'country' && !isCountryDropdownOpen) return;
        if (type === 'state' && !isStateDropdownOpen) return;

        const highlightedIndex = type === 'country' ? highlightedCountryIndex : highlightedStateIndex;
        const filteredList = type === 'country' ? filteredCountries : filteredStates;

        if (e.key === 'ArrowDown') {
            const newIndex = highlightedIndex === filteredList.length - 1 ? 0 : highlightedIndex + 1;
            if (type === 'country') setHighlightedCountryIndex(newIndex);
            else setHighlightedStateIndex(newIndex);
        } else if (e.key === 'ArrowUp') {
            const newIndex = highlightedIndex === 0 ? filteredList.length - 1 : highlightedIndex - 1;
            if (type === 'country') setHighlightedCountryIndex(newIndex);
            else setHighlightedStateIndex(newIndex);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            if (type === 'country') handleCountryChange(filteredCountries[highlightedIndex]);
            else handleStateChange(filteredStates[highlightedIndex]);
        }
    };

    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );

    const filteredStates = states.filter((state) =>
        state.name.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );

    return (
        <div className="flex relative flex-col">
            {/* Country Selector */}
            <div className="relative dropdown-container" ref={countryDropdownRef} onKeyDown={(e) => handleKeyDown(e, 'country')}>
                <div
                    className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus-within:outline-2 hover:outline-2 text-gray-700 cursor-pointer"
                    onClick={toggleCountryDropdown}
                    onKeyDown={(e) => { if (e.key === 'Enter') toggleCountryDropdown(); }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isCountryDropdownOpen}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {selectedCountry ? (
                                <>
                                    <Flag code={selectedCountry.isoCode} className="w-6 h-4 mr-2" />
                                    <span>{selectedCountry.name}</span>
                                </>
                            ) : (
                                <span>Select a country</span>
                            )}
                        </div>
                        {/* Icon */}
                    </div>
                </div>

                {isCountryDropdownOpen && (
                    <div className="absolute max-h-60 min-w-[250px] mt-2 bg-white rounded-lg shadow z-10">
                        <input
                            type="text"
                            value={countrySearchQuery}
                            onChange={(e) => {
                                setCountrySearchQuery(e.target.value);
                                setHighlightedCountryIndex(-1);
                            }}
                            className="w-[95%] h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 text-gray-700 text-[14px]"
                            placeholder="Search Country"
                        />
                        <ul className="max-h-40 overflow-y-auto text-[14px]">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${index === highlightedCountryIndex ? 'bg-gray-100' : ''
                                            }`}
                                        onClick={() => handleCountryChange(country)}
                                        onMouseEnter={() => setHighlightedCountryIndex(index)}
                                    >
                                        <Flag code={country.isoCode} className="w-6 h-4 mr-2" />
                                        <span>{country.name}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-gray-500">No results found</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* State Selector */}
            {selectedCountry && states.length > 0 && (
                <div className="relative dropdown-container" ref={stateDropdownRef} onKeyDown={(e) => handleKeyDown(e, 'state')}>
                    <div
                        className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus-within:outline-2 hover:outline-2 text-gray-700 cursor-pointer"
                        onClick={toggleStateDropdown}
                        onKeyDown={(e) => { if (e.key === 'Enter') toggleStateDropdown(); }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={isStateDropdownOpen}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {selectedState ? (
                                    <span>{selectedState.name}</span>
                                ) : (
                                    <span>Select a state</span>
                                )}
                            </div>
                            {/* Icon */}
                        </div>
                    </div>

                    {isStateDropdownOpen && (
                        <div className="absolute max-h-60 mt-2 bg-white rounded-lg shadow z-10">
                            <input
                                type="text"
                                value={stateSearchQuery}
                                onChange={(e) => {
                                    setStateSearchQuery(e.target.value);
                                    setHighlightedStateIndex(-1);
                                }}

                                className="w-[95%] h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 text-gray-700 text-[14px]"
                                placeholder="Search State"
                            />
                            <ul className="max-h-40 overflow-y-auto text-[14px]">
                                {filteredStates.length > 0 ? (
                                    filteredStates.map((state, index) => (
                                        <li
                                            key={index}
                                            className={`flex items-center p-3 min-w-[250px] cursor-pointer hover:bg-gray-100 ${index === highlightedStateIndex ? 'bg-gray-100' : ''
                                                }`}
                                            onClick={() => handleStateChange(state)}
                                            onMouseEnter={() => setHighlightedStateIndex(index)}
                                        >
                                            <span>{state.name}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-3 text-gray-500">No results found</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressSelector;