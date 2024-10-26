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

const CountrySelector = ({ onCountryChange }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

    useEffect(() => {
        const countriesData = Country.getAllCountries();
        const formattedCountries = countriesData.map((country) => ({
            name: country.name,
            isoCode: country.isoCode.toLowerCase(),
            code: country.isoCode,
        }));
        setCountries(formattedCountries);
    }, []);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        onCountryChange(country);
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen) return;
        
        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === filteredCountries.length - 1 ? 0 : prevIndex + 1
            );
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === 0 ? filteredCountries.length - 1 : prevIndex - 1
            );
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            handleCountryChange(filteredCountries[highlightedIndex]);
        }
    };

    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative dropdown-container" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <div className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus-within:outline-2  hover:outline-2 text-gray-700 cursor-pointer" onClick={toggleDropdown} role="button" aria-expanded={isDropdownOpen}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            {isDropdownOpen && (
                <div className="absolute max-h-60 mt-2 bg-white rounded-lg shadow z-10">
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
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country, index) => (
                                <li
                                key={index}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                                    index === highlightedIndex ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleCountryChange(country)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
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
    );
};

const StateSelector = ({ selectedCountry, onStateChange, isMandatory }) => {
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

    useEffect(() => {
        if (selectedCountry) {
            const statesData = State.getStatesOfCountry(selectedCountry.code);
            setStates(statesData);
            setSelectedState(null); // Reset state selection on country change
        }
    }, [selectedCountry]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleStateChange = (state) => {
        setSelectedState(state);
        setIsDropdownOpen(false);
        onStateChange(state);
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen) return;

        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === filteredStates.length - 1 ? 0 : prevIndex + 1
            );
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === 0 ? filteredStates.length - 1 : prevIndex - 1
            );
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            handleStateChange(filteredStates[highlightedIndex]);
        }
    };

    const filteredStates = states.filter((state) =>
        state.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <div className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus-within:outline-2 hover:outline-2 text-gray-700 cursor-pointer">
                <div className="flex items-center justify-between">
                    {states.length > 0 ? (
                        <>
                            <div className="flex items-center w-full" onClick={toggleDropdown}>
                                {selectedState ? (
                                    <span>{selectedState.name}</span>
                                ) : (
                                    <span>{isMandatory ? 'Select a state' : 'No states available'}</span>
                                )}
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center cursor-not-allowed w-full">
                                <span>No states available</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </>
                    )}
                </div>
            </div>

            {isDropdownOpen && states.length > 0 && (
                <div className="absolute max-w-[250px] max-h-60 m-2 bg-white rounded-lg shadow z-10">
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
                        {filteredStates.length > 0 ? (
                            filteredStates.map((state, index) => (
                                <li
                                    key={index}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                                        index === highlightedIndex ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleStateChange(state)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
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
    );
};

const CountryStateSelector = () => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [isStateMandatory, setIsStateMandatory] = useState(false);

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        const states = State.getStatesOfCountry(country.code);
        setIsStateMandatory(states.length > 0); // Set state mandatory only if the country has states
    };

    return (
        <div className="flex flex-col">
            <CountrySelector onCountryChange={handleCountryChange} />
            <StateSelector className={`selectedCountry ? '' : 'disabled'`} selectedCountry={selectedCountry} isMandatory={isStateMandatory} onStateChange={(state) => console.log("Selected State:", state)} />
        </div>
    );
};

export default CountryStateSelector;