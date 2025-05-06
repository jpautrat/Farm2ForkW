import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Using axios for slightly cleaner requests, could use fetch too.

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken')); // Load token from storage initially
    const [loading, setLoading] = useState(true); // Start loading true until initial user check is done
    const [error, setError] = useState(null);

    // Set authorization header for axios requests when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('authToken', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
        }
    }, [token]);

    // Load user data based on token on initial mount
    const loadUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // The proxy in vite.config.js handles '/api'
            const response = await axios.get('/api/auth/me'); 
            setUser(response.data.user);
            setError(null);
        } catch (err) {
            console.error("Load User Error:", err.response ? err.response.data : err.message);
            // If token is invalid (e.g., expired, user deleted), log out
            if (err.response && (err.response.status === 401 || err.response.status === 404)) {
                 setToken(null);
                 setUser(null);
                 setError('Session expired or invalid. Please log in again.');
            } else {
                setError('Failed to load user data.');
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadUser();
    }, [loadUser]); // Run loadUser when component mounts or token changes

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                return true; // Indicate success
            } else {
                 setError(response.data.message || 'Login failed');
                 return false;
            }
        } catch (err) {
            console.error("Login Error:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
             setUser(null);
            setToken(null);
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (name, email, password, role) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/register', { name, email, password, role });
            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                return true; // Indicate success
            } else {
                setError(response.data.message || 'Registration failed');
                return false;
            }
        } catch (err) {
            console.error("Registration Error:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setUser(null);
            setToken(null);
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        setError(null);
        // No API call needed for basic JWT logout, just clear client-side state/token
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, error, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
