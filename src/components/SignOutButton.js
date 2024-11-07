import React, {useState} from 'react';
import axios from 'axios';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';

const SignOutButton = () => {
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            // Call the backend signout route
            await axios.post('/api/auth/signout', {}, { withCredentials: true });
            navigate('/signin');
        } catch (error) {
            const newErrors = {};
            newErrors.clientError = error.response?.data?.message || '500 - Internal server error.';
            setErrors(newErrors);
            setAlert({ message: newErrors.clientError, type: 'error' }); // Set error alert
        }
    };

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
