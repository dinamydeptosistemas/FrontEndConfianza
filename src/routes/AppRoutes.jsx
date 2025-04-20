import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Importar los componentes con los nombres correctos
import LoginGeneral from '../pages/LoginGeneral';
import DashboardInterno from '../pages/DashboardInterno';

export const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Ruta pública - Login */}
            <Route 
                path="/login" 
                element={
                    user ? (
                        <Navigate to={sessionStorage.getItem('returnUrl') || '/dashboard/internal'} replace />
                    ) : (
                        <LoginGeneral />
                    )
                } 
            />

            {/* Rutas protegidas */}
            <Route
                path="/dashboard/internal"
                element={
                    <ProtectedRoute>
                        <DashboardInterno />
                    </ProtectedRoute>
                }
            />

            {/* Redirigir la ruta raíz según el estado de autenticación */}
            <Route
                path="/"
                element={
                    <Navigate to={user ? '/dashboard/internal' : '/login'} replace />
                }
            />

            {/* Ruta para cualquier otra URL no definida */}
            <Route
                path="*"
                element={
                    <Navigate to={user ? '/dashboard/internal' : '/login'} replace />
                }
            />
        </Routes>
    );
}; 