import React, { useState, useEffect } from 'react';
import SignOutButton from './SignOutButton';
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import LoadingBar from './LoadingBar'; // Import the LoadingBar component
import Alert from './Alert';
import axios from 'axios';

const CheckoutCart = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const { user, fetchUser, isLoading } = useUser();
    const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get('/api/payment/order-details', { withCredentials: true });
                const fetchedDetails = response.data.orderDetails;
                
                // Convert Decimal128 to string or number
                fetchedDetails.total = fetchedDetails.total?.$numberDecimal || '0.00';
                setOrderDetails(fetchedDetails);
            } catch (error) {
                setAlert({ message: 'There is error while fetching Order Details', type: 'error' }); // Set error alert
                navigate('/selectplan');
            }
        };

        fetchOrderDetails();
    }, [navigate]);

    const handlePayment = async () => {
        setLoadingProgress(20);

        if (!orderDetails) {
            setAlert({ message: 'Order details not available.', type: 'error' }); // Set error alert
            return;
        }

        try {
            setLoadingProgress(50);

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY, // Your Razorpay Key
                amount: (parseFloat(orderDetails.total) * 100).toString(), // Razorpay expects amount in paise (cents)
                currency: 'INR',
                name: 'Your Company Name',
                description: `Plan: ${orderDetails.planName}`,
                image: '/path/to/your/logo.png',
                order_id: orderDetails.orderId, // Pass the order ID from the backend
                handler: async function (response) {
                    try {
                        // Verify payment
                        await axios.post(
                            '/api/payment/verify-payment',
                            { paymentData: response, planId: orderDetails.planId }
                        );

                        // Handle successful verification
                        setAlert({ message: 'Payement Success!', type: 'success' }); // Set error alert
                        setLoadingProgress(80);

                        // Update user context and navigate
                        await fetchUser(); // Ensure this function is asynchronous
                        setTimeout(() => {
                            setLoadingProgress(100);
                            navigate('/dashboard', { replace: true });
                        }, 500); 
                    } catch (error) {
                        setAlert({ message: error, type: 'error' }); // Set error alert
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#014C93', // Customize the color of the Razorpay widget
                },
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open(); // Open Razorpay checkout
        } catch (error) {
            setAlert({ message: 'Payment initiation failed!', type: 'error' }); // Set error alert
        }
    };


    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                Loading...
            </div>
        );
    }

    if (!orderDetails) {
        return null; // Optionally render nothing while redirecting
    }

    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-1'>
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}
            <div className='flex text-center md:text-left items-center justify-between w-full'>
                <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                <div
                    className='flex items-center underline mx-1'
                    onClick={toggleDropdown}
                    tabIndex={0}
                    role='button'
                    aria-expanded={isDropdownOpen}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen);
                    }}
                >
                    <p className='m-1'>{user?.name}</p>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-chevron-down'
                    >
                        <path d='m6 9 6 6 6-6' />
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
                        <ul className='max-h-48 overflow-y-auto w-[120px]'>
                            <li className='p-3 hover:bg-gray-100'>
                                <SignOutButton />
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
                        <div>
                            <p>Order ID</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>{orderDetails?.orderId || 'N/A'}</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div>
                            <p>Plan Name</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>{orderDetails?.planName || 'N/A'}</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div>
                            <p>Validity</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>{orderDetails?.planValidity || 'N/A'} Days</p>
                        </div>
                    </div>
                    <div className='flex my-4 justify-between'>
                        <div>
                            <p>Price</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='font-semibold'>₹{orderDetails?.total || '0.00'}</p>
                        </div>
                    </div>
                    <hr />
                    <div className='flex my-4 justify-between'>
                        <div>
                            <p className='text-[20px] font-semibold'>Total</p>
                        </div>
                        <div className='flex items-center'>
                            <p className='text-[20px] font-semibold text-customPrimary'>
                                ₹{orderDetails?.total || '0.00'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between p-5'>
                        <img src='/images/visa.png' className='w-14 h-fit' alt='Visa' />
                        <img src='/images/mastercard.png' className='w-14 h-fit' alt='Mastercard' />
                        <img src='/images/rupay.png' className='w-14 h-fit' alt='RuPay' />
                        <img src='/images/upi.png' className='w-14 h-fit' alt='UPI' />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handlePayment}
                    className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'
                >
                    Pay Now
                </button>
            </form>
            {alert && (
                <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
            )}
            <footer className='my-4 items-center'>
                <p className='text-sm font-thin text-center text-gray-500'>
                    Copyright &copy; by All-In-One & Agile Business Management Software{' '}
                    {new Date().getFullYear()}.
                </p>
            </footer>
        </div>
    );
};

export default CheckoutCart;