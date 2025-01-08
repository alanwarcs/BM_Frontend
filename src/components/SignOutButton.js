import React, { useState } from 'react';
import axios from 'axios';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

const SignOutButton = () => {
    const [alert, setAlert] = useState(null);
    const { setUser, isLoading } = useUser(); // Destructure setUser from useUser
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            // Call the backend signout route
            const response = await axios.post('/api/auth/signout', {}, { withCredentials: true });

            // Check if the response indicates a successful sign-out
            if (response.status === 200) {
                // Clear any client-side storage or state
                localStorage.clear(); // Clear local storage
                sessionStorage.clear(); // Clear session storage

                // Update the user state to null
                setUser(null);

                // Navigate to the sign-in page
                navigate('/signin', { replace: true });
            } else {
                // Handle unexpected response status
                setAlert({ message: 'Sign-out failed. Please try again.', type: 'error' });
            }
        } catch (error) {
            // Handle errors during the sign-out process
            const errorMessage = error.response?.data?.message || 'An error occurred during sign-out.';
            setAlert({ message: errorMessage, type: 'error' });
        }
    };

    // Show loading indicator while data is being fetched
    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
    }

    return (
        <>
            {alert && (
                <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
            )}
            <button onClick={handleSignOut} className="">
                SignOut
            </button>
        </>
    );
};

export default SignOutButton;