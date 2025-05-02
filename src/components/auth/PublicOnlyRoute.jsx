import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) {
        // Redirige al dashboard correspondiente si ya está logueado
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}; 