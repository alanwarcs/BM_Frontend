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
                if (!user.organization.isSetupCompleted && !isAuthenticatedPage) {
                    navigate('/setup', { replace: true });
                } else if (!user.organization.isPaid && !isAuthenticatedPage) {
                    navigate('/select-plan', { replace: true });
                } else if (user.organization.isPaid && window.location.pathname !== '/dashboard' && isAuthenticatedPage) {
                    navigate('/dashboard', { replace: true });
                }
            } else if (!isAuthenticatedPage) {
                setErrorMessage('Authentication failed. Please sign in again.');
                navigate('/signin', { replace: true });
            }
        }
    }, [user, isLoading, isAuthenticatedPage, navigate]);

    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading spinner
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