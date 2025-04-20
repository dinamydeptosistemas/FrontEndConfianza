import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Importar los componentes con los nombres correctos
import LoginGeneral from '../pages/LoginGeneral';
import DashboardInterno from '../pages/DashboardInterno';
import DashboardLayout from '../layouts/DashboardLayout';

export const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Ruta pública - Login */}
            <Route 
                path="/login" 
                element={
                    user ? (
                        <Navigate to={sessionStorage.getItem('returnUrl') || '/dashboard'} replace />
                    ) : (
                        <LoginGeneral />
                    )
                } 
            />

            {/* Rutas protegidas con DashboardLayout */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                {/* Rutas anidadas dentro del dashboard */}
                <Route index element={<DashboardInterno />} />
                <Route path="internal" element={<DashboardInterno />} />
                
                {/* Aquí puedes añadir más rutas anidadas para las otras secciones */}
                {/* <Route path="empresas" element={<EmpresasPage />} /> */}
                {/* <Route path="usuarios" element={<UsuariosPage />} /> */}
            </Route>

            {/* Redirigir la ruta raíz según el estado de autenticación */}
            <Route
                path="/"
                element={
                    <Navigate to={user ? '/dashboard' : '/login'} replace />
                }
            />

            {/* Ruta para cualquier otra URL no definida */}
            <Route
                path="*"
                element={
                    <Navigate to={user ? '/dashboard' : '/login'} replace />
                }
            />
        </Routes>
    );
}; 