import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginGeneral from '../pages/LoginGeneral';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardLayoutLight from '../layouts/DashboardLayoutLight';
import DashboardLayoutLighter from '../layouts/DashboardLayoutLighter';
import ManagerSystemPage from '../pages/ManagerSystemPage';
import DashboardExterno from '../pages/DashboardExterno';
import DashboardGerencia from '../pages/DashboardGerencia';
import EmpresasDashboard from '../pages/empresa/EmpresasDashboard';
import RegisterUserInternal from '../pages/registrer/RegisterUserInternal';

export const AppRoutes = () => {
    const { user, loading, isInitialized } = useAuth();

    // Verificación más estricta del estado de autenticación
    const isAuthenticated = user && user.StatusCode === 200;
    const isManagerSystem = isAuthenticated && (user.CodeFunction === 1 || user.UserFunction === 'MANAGER SYSTEM');
    const isAdministracion = isAuthenticated && (user.CodeFunction === 2 || user.UserFunction === 'ADMINISTRACION');

    // No renderizar nada hasta que la verificación inicial esté completa
    if (!isInitialized) {
        return null;
    }

    // Mostrar loading solo si estamos inicializados pero aún cargando
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    console.log('Ruta actual en AppRoutes:', window.location.pathname);
    const publicRoutes = ['/login', '/registrar-usuario-interno'];
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginGeneral />} 
            />
            <Route
                path="/registrar-usuario-interno"
                element={<RegisterUserInternal />} 
            />

            {/* Ruta independiente para empresas */}
            <Route 
                path="/dashboard/empresas" 
                element={isAuthenticated && isManagerSystem ? <EmpresasDashboard /> : <Navigate to="/login" replace />} 
            />

            {/* Rutas protegidas */}
            <Route 
                path="/dashboard/*" 
                element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
                <Route index element={<ManagerSystemPage />} />
                <Route path="internal" element={isManagerSystem ? <ManagerSystemPage /> : <Navigate to="/dashboard" replace />} />
                <Route path="gerencia" element={isAdministracion ? <DashboardGerencia /> : <Navigate to="/dashboard" replace />} />
                <Route path="perfil-acceso" element={<ManagerSystemPage />} />
                <Route path="usuarios" element={<ManagerSystemPage />} />
                <Route path="permisos" element={<ManagerSystemPage />} />
                <Route path="bitacora" element={<ManagerSystemPage />} />
                <Route path="tramites" element={<ManagerSystemPage />} />
                <Route path="email-redes" element={<ManagerSystemPage />} />
            </Route>

            <Route 
                path="/dashboard-light/*" 
                element={isAuthenticated ? <DashboardLayoutLight /> : <Navigate to="/login" replace />}
            >
                <Route path="gerencia/usuarios" element={<DashboardGerencia />} />
                <Route path="gerencia/configuracion-inicial" element={<DashboardGerencia />} />
                <Route path="gerencia/configuracion-general" element={<DashboardGerencia />} />
                <Route path="gerencia/correccion-errores" element={<DashboardGerencia />} />
                <Route path="gerencia/reportes" element={<DashboardGerencia />} />
            </Route>

            <Route 
                path="/dashboard-lighter/*" 
                element={isAuthenticated ? <DashboardLayoutLighter /> : <Navigate to="/login" replace />}
            >
                <Route path="external" element={<DashboardExterno />} />
            </Route>

            {/* Rutas de roles específicos */}
            <Route path="contador" element={isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace />} />
            <Route path="supervisor" element={isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace />} />
            <Route path="auxiliar" element={isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace />} />
            <Route path="cajero" element={isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace />} />
            <Route path="vendedor" element={isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace />} />

            {/* Ruta por defecto */}
            <Route path="*" element={
                publicRoutes.includes(window.location.pathname)
                    ? null
                    : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } />
        </Routes>
    );
}; 