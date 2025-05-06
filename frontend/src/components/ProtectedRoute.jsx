import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component wraps routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if authentication check is complete (user state is not null or explicitly false)
  // This avoids redirecting before the AuthProvider has initialized
  // Optional: Add a loading state here if initialization is slow

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;
