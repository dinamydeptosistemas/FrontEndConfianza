import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import {  useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Lógica de validación
    const isValidUser =
        user &&
        (user.userType === 1 || user.userType === 2) &&
        (user.statusCode === 200 || user.statusCode === 201);

    useEffect(() => {
        if (!isValidUser && !loading) {
            localStorage.clear();
            sessionStorage.setItem('returnUrl', location.pathname);
        }
    }, [isValidUser, loading, location]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    if (!isValidUser) {
        // Puedes guardar logs aquí si quieres
        // localStorage.setItem('protectedRouteLog', JSON.stringify({ user, ... }));
        return <Navigate to="/login" replace />;
    }

    return children;
}; 