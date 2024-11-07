// ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';

const ProtectedRoute = ({ component: Component, isAuthenticatedPage, ...rest }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
    const [error, setError] = useState(null); // State for error messages
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axios.post('/api/auth/validate-user', {}, { withCredentials: true });
                if (response.status === 200) {
                    setIsAuthenticatedUser(true);
                } else {
                    setIsAuthenticatedUser(false);
                }
            } catch (err) {
                setIsAuthenticatedUser(false);
                if (err.response?.data?.error) {
                    // Set a specific error message from the server response
                    setError(err.response.data.error);
                } else {
                    setError('Authentication failed. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If the user is logged in and tries to access a sign-in or sign-up page, go back to the previous page
    if (isAuthenticatedUser && isAuthenticatedPage) {
        window.history.back(); // Go back to the previous page
        return null;
    }

    if (!isAuthenticatedUser && !isAuthenticatedPage) {
        navigate('/signin'); // Redirect to login if not authenticated
        return null;
    }

    return (
        <>
            {/* Display Alert if there’s an error */}
            {error && (
                <Alert
                    message={error}
                    type="error"
                    handleClose={() => setError(null)} // Reset error on close
                />
            )}
            <Component {...rest} />
        </>
    );
};

export default ProtectedRoute;