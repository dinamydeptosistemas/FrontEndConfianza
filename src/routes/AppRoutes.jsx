import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useCurrentUser } from '../contexts/CurrentUserContext';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardLayoutLight from '../layouts/DashboardLayoutLight';
import DashboardLayoutLighter from '../layouts/DashboardLayoutLighter';

// Pages
import LoginGeneral from '../pages/LoginGeneral';
import ManagerSystemPage from '../pages/ManagerSystemPage';
import DashboardExterno from '../pages/DashboardExterno';
import DashboardGerencia from '../pages/DashboardGerencia';
import EmpresasDashboard from '../pages/empresa/EmpresasDashboard';
import RegisterUserInternal from '../pages/registrer/RegisterUserInternal';
import PerfilAccesoDashboard from '../pages/perfilAcceso/PerfilAccesoDashboard';
import UsuarioDashboard from '../pages/usuario/UsuarioDashboard';
import PermisosDashboard from '../pages/permisos/PermisosDashboard';
import BitacoraDashboard from '../pages/bitacora/BitacoraDashboard';
import BitacoraUsuariosActivos from '../pages/bitacora/BitacoraUsuariosActivos';
import SocialMediaDashboard from '../pages/socialmedia/socialmediadashboard';
import PaperworksDashboard from '../pages/paperworks/PaperworksDashboard';
import RegistrerUserExternal from '../pages/registrer/RegistrerUserExternal';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import DataCleanup from '../components/DataCleanup/DataCleanup';
import ConfiguracionPage from '../pages/ConfiguracionPage';
import NotFound from '../pages/NotFound';
import EmptyPage from '../pages/EmptyPage';

const AppRoutesContent = () => {
    const { user } = useAuth();

    const isAuthenticated = !!user;
    
    const isManagerSystem = isAuthenticated && (
        user.CodeFunction === 1 || 
        user.UserFunction === 'manager system' || 
        user.UserFunction === 'MANAGER SYSTEM'
    );
    
    const isAdministracion = isAuthenticated && (
        user.CodeFunction === 2 || 
        user.UserFunction === 'ADMINISTRACION'
    );

    const routes = [
        {
            path: "/login",
            element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginGeneral />,
        },
        {
            path: "/registrar-usuario-interno",
            element: <RegisterUserInternal />,
        },
        {
            path: "/registrar-usuario-externo",
            element: <RegistrerUserExternal />,
        },
        {
            path: "/validate-email",
            element: <EmailVerificationPage />,
        },
        {
            path: "/dashboard",
            element: isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />,
            children: [
                { index: true, element: <ManagerSystemPage /> },
                { path: "internal", element: isManagerSystem ? <ManagerSystemPage /> : <Navigate to="/dashboard" replace /> },
                { path: "gerencia", element: isAdministracion ? <DashboardGerencia /> : <Navigate to="/dashboard" replace /> },
                
            ]
        },
                { path: "/dashboard/usuarios", element: <UsuarioDashboard /> },
                { path: "/dashboard/permisos", element: isManagerSystem ? <PermisosDashboard /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/bitacora", element: isManagerSystem ? <BitacoraDashboard /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/tramites", element: isManagerSystem ? <PaperworksDashboard /> : <Navigate to="/dashboard" replace /> },
                { path: "/dashboard/empresas", element: isManagerSystem ? <EmpresasDashboard /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/perfil-acceso", element: isManagerSystem ? <PerfilAccesoDashboard /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/usuarios-activos", element: isManagerSystem ? <BitacoraUsuariosActivos /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/data-cleanup", element: isManagerSystem ? <DataCleanup /> : <Navigate to="/login" replace /> },
                { path: "/dashboard/redes-sociales", element: isManagerSystem ? <SocialMediaDashboard /> : <Navigate to="/login" replace /> }
        ,
        {
            path: "/configuracion",
            element: isManagerSystem ? <ConfiguracionPage/> : <Navigate to="/dashboard" replace />
        },
        {
            path: "/configuracion/next",
            element: isAuthenticated ? <EmptyPage /> : <Navigate to="/login" replace />
        },
        {
            path: "/dashboard-light/*",
            element: isAuthenticated ? <DashboardLayoutLight /> : <Navigate to="/login" replace />,
            children: [
                { path: "gerencia/usuarios", element: <DashboardGerencia /> },
                { path: "gerencia/configuracion-inicial", element: <DashboardGerencia /> },
                { path: "gerencia/configuracion-general", element: <DashboardGerencia /> },
                { path: "gerencia/correccion-errores", element: <DashboardGerencia /> },
                { path: "gerencia/reportes", element: <DashboardGerencia /> },
            ]
        },
        {
            path: "/dashboard-lighter/*",
            element: isAuthenticated ? <DashboardLayoutLighter /> : <Navigate to="/login" replace />,
            children: [
                { path: "external", element: <DashboardExterno /> },
            ]
        },
        { path: "/contador", element: isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace /> },
        { path: "/supervisor", element: isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace /> },
        { path: "/auxiliar", element: isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace /> },
        { path: "/cajero", element: isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace /> },
        { path: "/vendedor", element: isAuthenticated ? <DashboardGerencia /> : <Navigate to="/login" replace /> },
        {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
        },
        {
            path: "*",
            element: <NotFound />,
        }
    ];

    const element = useRoutes(routes);

    return element;
}

export const AppRoutes = () => {
    const { loading: authLoading, isInitialized: authInitialized } = useAuth();
    const { loading: configLoading } = useConfig();
    const { loading: userLoading, isInitialized: userInitialized } = useCurrentUser();

    if (!authInitialized || !userInitialized || authLoading || userLoading || configLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <AppRoutesContent />;
};