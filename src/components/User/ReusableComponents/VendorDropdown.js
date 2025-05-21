import React, { useState, useEffect, useRef } from 'react';

const VendorDropdown = ({ vendors, onSelectVendor, initialVendorName }) => {
    const [vendorDropdownVisible, setVendorDropdownVisible] = useState(false);
    const [filteredVendors, setFilteredVendors] = useState(vendors);
    const [highlightedIndex, setHighlightedIndex] = useState(-2);
    const vendorRef = useRef();
    const inputRef = useRef();

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendorRef.current && !vendorRef.current.contains(event.target)) {
                setVendorDropdownVisible(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Update filtered vendors when vendors prop changes
    useEffect(() => {
        setFilteredVendors(vendors);
        setHighlightedIndex(vendors.length > 0 ? 0 : -1);
    }, [vendors]);

    const handleVendorSearch = (value) => {
        onSelectVendor({ vendorId: '', vendorName: value });
        const searchTerm = value.toLowerCase().trim();
        if (searchTerm) {
            const filtered = vendors.filter((v) =>
                v.displayName?.toLowerCase().includes(searchTerm)
            );
            setFilteredVendors(filtered);
            setHighlightedIndex(filtered.length > 0 ? 0 : -1);
        } else {
            setFilteredVendors(vendors);
            setHighlightedIndex(vendors.length > 0 ? 0 : -1);
        }
        setVendorDropdownVisible(true);
    };

    const handleVendorKeyDown = (e) => {
        if (!vendorDropdownVisible) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    if (prev <= 0) return filteredVendors.length - 1;
                    return prev - 1;
                });
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    if (prev >= filteredVendors.length - 1) return 0;
                    return prev + 1;
                });
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredVendors.length) {
                    const selectedVendor = filteredVendors[highlightedIndex];
                    const vendorId = selectedVendor._id || selectedVendor.id; // Support both _id and id
                    if (!vendorId) {
                        return;
                    }
                    onSelectVendor({
                        vendorId,
                        vendorName: selectedVendor.displayName
                    });
                    setVendorDropdownVisible(false);
                    setHighlightedIndex(-1);
                } else if (highlightedIndex === -1 && filteredVendors.length === 0) {
                    setVendorDropdownVisible(false);
                    setHighlightedIndex(-1);
                }
                break;
            case 'Escape':
                setVendorDropdownVisible(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    return (
        <div ref={vendorRef} className='flex flex-col w-fit m-2 relative text-sm'>
            <label htmlFor="vendor" className="mb-2">
                Vendor <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="vendorName"
                value={initialVendorName}
                onChange={(e) => handleVendorSearch(e.target.value)}
                onFocus={() => {
                    setFilteredVendors(vendors);
                    setVendorDropdownVisible(true);
                    setHighlightedIndex(vendors.length > 0 ? 0 : -1);
                }}
                onKeyDown={handleVendorKeyDown}
                ref={inputRef}
                placeholder="Select or Search Vendor"
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                autoComplete="off"
            />
            {vendorDropdownVisible && (
                <ul className="absolute z-50 top-[65px] w-[250px] bg-white border border-gray-200 rounded-md max-h-52 overflow-y-auto shadow-md">
                    {filteredVendors.length > 0 ? (
                        filteredVendors.map((vendor, index) => (
                            <li
                                key={vendor._id || vendor.id || index} // Fallback to index if no ID
                                className={`px-3 py-2 cursor-pointer ${
                                    index === highlightedIndex ? 'bg-gray-200' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => {
                                    const vendorId = vendor._id || vendor.id;
                                    if (!vendorId) {
                                        return;
                                    }
                                    onSelectVendor({
                                        vendorId,
                                        vendorName: vendor.displayName
                                    });
                                    setVendorDropdownVisible(false);
                                    setHighlightedIndex(-1);
                                }}
                            >
                                <span className="font-medium">{vendor.displayName}</span>
                                {vendor.email && (
                                    <span className="text-gray-400 text-xs block">{vendor.email}</span>
                                )}
                            </li>
                        ))
                    ) : (
                        <li
                            className={`px-3 py-2 text-customPrimary cursor-pointer ${
                                highlightedIndex === -1 ? 'bg-gray-100' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                                setVendorDropdownVisible(false);
                                setHighlightedIndex(-1);
                            }}
                        >
                            + Add New Vendor
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default VendorDropdown;