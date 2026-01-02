import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication.
 * Shows loading spinner while auth state is being determined.
 * Redirects to signin if user is not authenticated after loading completes.
 */
export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <LoadingSpinner fullPage message="Checking authentication..." />;
    }

    // If not authenticated after loading, redirect to signin
    // Save the attempted location so we can redirect back after login
    if (!currentUser) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected content
    return children;
}

/**
 * PublicOnlyRoute Component
 * Wraps routes that should only be accessible to non-authenticated users.
 * Redirects authenticated users to dashboard.
 */
export function PublicOnlyRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <LoadingSpinner fullPage message="Loading..." />;
    }

    // If authenticated, redirect to dashboard or the page they came from
    if (currentUser) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // User is not authenticated, render the public content
    return children;
}
