import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import Alert from './Alert';

const ProtectedRoute = ({ component: Component, isAuthenticatedPage, ...rest }) => {
    const { user, isLoading } = useUser();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                const { isSetupCompleted, isPaid, subscriptionStatus } = user.organization;

                if (!isAuthenticatedPage) {
                    // Redirect authenticated users away from public routes (e.g., /signin, /signup)
                    navigate('/dashboard', { replace: true });
                } else {
                    // Handle authenticated page access
                    if (!isSetupCompleted) {
                        navigate('/setup', { replace: true });
                    } else if (!isPaid) {
                        navigate('/select-plan', { replace: true });
                    } else if (subscriptionStatus !== 'active') {
                        setErrorMessage('Your subscription has expired. Please renew your plan.');
                        navigate('/select-plan', { replace: true });
                    }
                }
            } else if (isAuthenticatedPage) {
                // Handle unauthenticated access to protected pages
                setErrorMessage('Authentication failed. Please sign in again.');
                navigate('/signin', { replace: true });
            }
        }
    }, [user, isLoading, isAuthenticatedPage, navigate]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
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