import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ component: Component, isAuthenticatedPage, ...rest }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
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
            } catch (error) {
                setIsAuthenticatedUser(false);
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
        return null; // Prevent rendering of the current page
    }

    if (!isAuthenticatedUser && !isAuthenticatedPage) {
        navigate('/signin'); // Redirect to login if not authenticated
        return null;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;
