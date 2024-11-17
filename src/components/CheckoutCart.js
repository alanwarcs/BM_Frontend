import React, { useState } from 'react'
import { useUser } from '../context/userContext';

const CheckoutCart = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, isLoading } = useUser();
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }
    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-1'>
            <div className='flex text-center md:text-left items-center justify-between w-full'>
                <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                <div className='flex items-center underline mx-1' onClick={toggleDropdown} tabIndex={0} role="button" aria-expanded={isDropdownOpen} onKeyDown={(e) => { if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen); }}>
                    <p className='m-1'>{user?.name}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
                        <ul className="max-h-48 overflow-y-auto w-[120px]">
                            <li className="p-3 hover:bg-gray-100">
                                <a href="/">Logout</a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <form className='rounded-xl md:shadow p-5 text-right'>
                <div className='p-2'>
                    <h1 className='text-center text-[20px] m-2 font-bold'>Checkout Summary</h1>
                    <p className='text-center m-4'>
                        Complete your purchase and unlock your <br /> plan's full potential!
                    </p>
                    <hr />
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className=''>Transition Id</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>AA202412000100</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className=''>Plan Name</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>Basic</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className=''>Validity</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>1-Month</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className=''>Price</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>₹10.00</p>
                        </div>
                    </div>
                    <hr />
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className=''>Tax</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>-</p>
                        </div>
                    </div>
                    <hr />
                    <div className='flex my-4 justify-between'>
                        <div className=''>
                            <p className='text-[20px] font-semibold'>Total</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='text-[20px] font-semibold text-customPrimary'>₹10.00</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between p-5'>
                        <img src="/images/visa.png" className='w-14 h-fit' alt="" />
                        <img src="/images/mastercard.png" className='w-14 h-fit' alt="" />
                        <img src="/images/rupay.png" className='w-14 h-fit' alt="" />
                        <img src="/images/upi.png" className='w-14 h-fit' alt="" />
                    </div>
                </div>
                <button className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'>
                    Pay Now
                </button>
            </form>

            <footer className='my-4 items-center'>
                <p className='text-sm font-thin text-center text-gray-500'>
                    Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
                </p>
            </footer>
        </div>
    );
}

export default CheckoutCart
