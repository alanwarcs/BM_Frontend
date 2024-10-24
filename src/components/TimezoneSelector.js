import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-timezone';

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

const TimezoneSelector = ({ onTimezoneChange, selectedTimezone }) => {
    const [timezones, setTimezones] = useState([]);
    const [currentTimezone, setCurrentTimezone] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

    // Initialize the timezones on component mount
    useEffect(() => {
        const tzData = moment.tz.names().map((name) => {
            const offset = moment.tz(name).utcOffset();
            return {
                name,
                offset
            };
        });
        setTimezones(tzData);
    }, []);

    useEffect(() => {
        if (selectedTimezone) {
            const timezone = timezones.find(tz => tz.name === selectedTimezone);
            if (timezone) {
                setCurrentTimezone(timezone);
                onTimezoneChange(timezone); // Notify parent component
            }
        }
    }, [selectedTimezone, timezones, onTimezoneChange]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleTimezoneChange = (timezone) => {
        setCurrentTimezone(timezone);
        setIsDropdownOpen(false);
        onTimezoneChange(timezone);
    };

    const filteredTimezones = timezones.filter((tz) =>
        tz.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative dropdown-container" ref={dropdownRef}>
            <div className="py-3 px-4 m-2 rounded-lg outline outline-1 text-[14px] outline-customSecondary focus-within:outline-2 text-gray-700 cursor-pointer" onClick={toggleDropdown} role="button" aria-expanded={isDropdownOpen}>
                <div className="flex items-center justify-between">
                    <span>{currentTimezone ? `${currentTimezone.name} (UTC${currentTimezone.offset >= 0 ? '+' : ''}${currentTimezone.offset / 60})` : 'Select a timezone'}</span>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[95%] h-10 py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 text-gray-700 text-[14px]"
                        placeholder="Search"
                    />
                    <ul className="max-h-40 overflow-y-auto text-[14px]">
                        {filteredTimezones.length > 0 ? (
                            filteredTimezones.map((timezone, index) => (
                                <li key={index} className="flex items-center p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleTimezoneChange(timezone)}>
                                    <span>{`${timezone.name} (UTC${timezone.offset >= 0 ? '+' : ''}${timezone.offset / 60})`}</span>
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

export default TimezoneSelector;