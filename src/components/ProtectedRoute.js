import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';

const ProtectedRoute = ({ component: Component, isAuthenticatedPage, ...rest }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Step 1: Validate User Authentication
                const response = await axios.post('/api/auth/validate-user', {}, { withCredentials: true });
                const user = response.data.user;

                if (response.status === 200) {
                    // Step 2: Check if setup is complete
                    if (!user.organization.isSetupCompleted) {
                        // Redirect to setup if setup is incomplete
                        if (!isAuthenticatedPage) {
                            navigate('/setup', { replace: true });
                            return;
                        }
                    } else {
                        // If setup is complete, prevent access to the setup page
                        if (window.location.pathname === '/setup') {
                            navigate('/dashboard', { replace: true });
                            return;
                        }

                        // Step 3: Check if payment is completed
                        if (!user.organization.isPaid) {
                            // Redirect to select-plan if payment is not done
                            if (!isAuthenticatedPage) {
                                navigate('/select-plan', { replace: true });
                                return;
                            }
                        } else {
                            // If payment is completed, redirect to dashboard if on an unauthenticated page
                            if (window.location.pathname === '/select-plan') {
                                navigate('/dashboard', { replace: true });
                                return;
                            }
                        }
                    }

                    // Set user as authenticated if all checks pass
                    setIsAuthenticatedUser(true);
                } else {
                    // If the response is not 200, show an error message
                    throw new Error();
                }
            } catch (error) {
                // Handle error and show error message only on protected routes
                if (!isAuthenticatedPage) {
                    setErrorMessage(error.response?.data?.message || 'Authentication failed. Please sign in again.');
                    navigate('/signin', { replace: true });
                }
                setIsAuthenticatedUser(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [isAuthenticatedPage, navigate]);

    if (isLoading) {
        return (
            <div className="flex w-screen h-screen items-center justify-center text-customPrimary">
                Loading...
            </div>
        );
    }

    // If the user is authenticated and trying to access public routes
    if (isAuthenticatedUser && isAuthenticatedPage) {
        window.history.back();
        return null;
    }

    return (
        <>
            {errorMessage && (
                <Alert
                    message={errorMessage}
                    type="error"
                    handleClose={() => setErrorMessage('')}
                />
            )}
            <Component {...rest} />
        </>
    );
};

export default ProtectedRoute;
