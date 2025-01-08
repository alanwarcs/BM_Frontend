import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a UserContext to hold user-related state
const UserContext = createContext();


// Custom hook to access user context
export const useUser = () => useContext(UserContext);

// UserProvider component to wrap the app and provide user data
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch user data from the server
    const fetchUser = async () => {
        try {
            const response = await axios.post('/api/auth/validate-user', {}, { withCredentials: true });
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };


    // Fetch user data when the component mounts
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};