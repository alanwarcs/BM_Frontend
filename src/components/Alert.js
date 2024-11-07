import React, { useEffect, useState } from 'react';

const Alert = ({ message, type, handleClose }) => {
    const [visible, setVisible] = useState(false);

    // Trigger the slide-in effect when the component mounts
    useEffect(() => {
        setTimeout(() => setVisible(true), 100); // Small delay to ensure slide-in
    }, []);

    // Handle closing the alert (slide-out effect)
    const closeAlert = () => {
        setVisible(false); // Triggers the slide-out animation
        setTimeout(() => handleClose(), 300); // Delay the removal of the component until the animation completes
    };

    // Define the styles for different alert types (success or error)
    const alertStyles = type === 'success'
        ? 'bg-green-500'
        : 'bg-red-500';

    return (
        <div className={`fixed bottom-4 right-4 z-10 max-w-[600px] p-2 ${alertStyles} text-white items-center border rounded-lg justify-center text-[14px] mx-2 flex transition-transform duration-200 ease-in-out transform ${ visible ? 'translate-x-0' : 'translate-x-full'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-shield-${type === 'success' ? 'check' : 'alert'} mx-2`}>
                {type === 'success' ? (
                    <path d="M20 6L9 17l-5-5" />
                ) : (
                    <>
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </>
                )}
            </svg>
            <p>{message}</p>
            <button onClick={closeAlert} className="ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x ms-6">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Alert;