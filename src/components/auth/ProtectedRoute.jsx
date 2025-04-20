import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Si no hay usuario y no está cargando, limpiar todo
        if (!user && !loading) {
            localStorage.clear();
            // Guardar la ruta actual para redirigir después del login
            sessionStorage.setItem('returnUrl', location.pathname);
        }
    }, [user, loading, location]);

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

    if (!user) {
        // Redirigir al login si no hay usuario autenticado
        return <Navigate to="/login" replace />;
    }

    return children;
}; 