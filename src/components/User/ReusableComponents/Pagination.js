import React, { useState } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [isClicking, setIsClicking] = useState(false);

    // Prevent multiple clicks within a short time
    const handlePageChange = (page) => {
        if (isClicking) return; // If already clicking, ignore the new click

        setIsClicking(true); // Set clicking to true
        onPageChange(page); // Trigger the page change

        // Set a timeout to reset the clicking state after a small delay
        setTimeout(() => {
            setIsClicking(false);
        }, 300); // Adjust the time in milliseconds as needed
    };

    // Calculate which pages to show
    const getPages = () => {
        let pages = [];

        if (totalPages <= 5) {
            // If total pages are 5 or less, show all
            pages = Array.from({ length: totalPages }, (_, index) => index + 1);
        } else {
            // Otherwise, show 5 pages with '...' in between
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...'];
            } else if (currentPage >= totalPages - 2) {
                pages = ['...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = ['...', currentPage - 1, currentPage, currentPage + 1, '...'];
            }
        }

        // Always include the last page number
        if (!pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex justify-end items-center mt-4 space-x-2 p-2">
            {/* Previous Button */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 bg-gray-100 rounded hover:bg-gray-200 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                >
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>

            {/* Pagination Buttons */}
            {pages.map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...' || page === currentPage}
                    className={`flex items-center justify-center w-10 h-10 ${
                        page === currentPage
                            ? 'bg-customPrimary text-white'
                            : page === '...'
                            ? 'cursor-default'
                            : 'bg-gray-100 hover:bg-gray-200'
                    } rounded`}
                >
                    {page}
                </button>
            ))}

            {/* Next Button */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 bg-gray-100 rounded hover:bg-gray-200 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right"
                >
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>
    );
};

export default Pagination;