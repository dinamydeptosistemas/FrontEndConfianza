import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { PublicOnlyRoute } from '../components/auth/PublicOnlyRoute';

// Importar los componentes con los nombres correctos
import LoginGeneral from '../pages/LoginGeneral';
import DashboardInterno from '../pages/DashboardInterno';
import DashboardExterno from '../pages/DashboardExterno';
import DashboardGerencia from '../pages/DashboardGerencia';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardLayoutLight from '../layouts/DashboardLayoutLight';
import DashboardLayoutLighter from '../layouts/DashboardLayoutLighter';
import RegisterUserInternal from '../pages/registrer/RegisterUserInternal';

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

            {/* Ruta pública para registro de usuario interno */}
            <Route 
                path="/registrar-usuario-interno" 
                element={
                    <PublicOnlyRoute>
                        <RegisterUserInternal />
                    </PublicOnlyRoute>
                } 
            />

            {/* Rutas protegidas con DashboardLayout (Admin) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardInterno />} />
                <Route path="internal" element={<DashboardInterno />} />
                <Route path="External" element={<DashboardExterno />} />
                <Route path="Gerencia" element={<DashboardGerencia />} />
            </Route>

            {/* Rutas protegidas con DashboardLayoutLight (Gerencia) */}
            <Route
                path="/dashboard-light"
                element={
                    <ProtectedRoute>
                        <DashboardLayoutLight />
                    </ProtectedRoute>
                }
            >
                <Route path="gerencia/usuarios" element={<DashboardGerencia />} />
                <Route path="gerencia/configuracion-inicial" element={<DashboardGerencia />} />
                <Route path="gerencia/configuracion-general" element={<DashboardGerencia />} />
                <Route path="gerencia/correccion-errores" element={<DashboardGerencia />} />
                <Route path="gerencia/reportes" element={<DashboardGerencia />} />
            </Route>

            {/* Rutas protegidas con DashboardLayoutLighter (Otros roles) */}
            <Route
                path="/dashboard-lighter"
                element={
                    <ProtectedRoute>
                        <DashboardLayoutLighter />
                    </ProtectedRoute>
                }
            >
                <Route path="contador" element={<DashboardGerencia />} />
                <Route path="supervisor" element={<DashboardGerencia />} />
                <Route path="auxiliar" element={<DashboardGerencia />} />
                <Route path="cajero" element={<DashboardGerencia />} />
                <Route path="vendedor" element={<DashboardGerencia />} />
                <Route path="externo" element={<DashboardGerencia />} />
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