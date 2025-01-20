import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-end items-center mt-4 space-x-2 p-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
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
            {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                    (page) =>
                        page <= 3 ||
                        page >= totalPages - 1 ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .reduce((acc, page, idx, filteredPages) => {
                    if (idx > 0 && page !== filteredPages[idx - 1] + 1) {
                        acc.push('...');
                    }
                    acc.push(page);
                    return acc;
                }, [])
                .map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
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
                onClick={() => onPageChange(currentPage + 1)}
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
