// frontend/src/components/FarmerRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Optional: Show loading state while auth checks

const FarmerRoute = () => {
    const { user, loading, token } = useContext(AuthContext);

    if (loading) {
        // Optional: Show a loading indicator while checking authentication status
        return <LoadingSpinner />;
    }

    // Check if user is logged in, has a token, AND has the 'farmer' role
    if (user && token && user.role === 'farmer') {
        return <Outlet />; // Render the nested farmer routes/pages
    } else {
        // Redirect to login page if not authenticated or not a farmer
        // You could also redirect to a specific 'Unauthorized' page
        return <Navigate to="/login" replace />;
    }
};

export default FarmerRoute;
