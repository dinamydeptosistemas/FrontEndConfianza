import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginGeneral from './pages/LoginGeneral';
import DashboardInterno from './pages/DashboardInterno';
import DashboardExterno from './pages/DashboardExterno';

// Componente para proteger rutas
const ProtectedRoute = ({ children, requiredUserType }) => {
    const { user } = useAuth();
    const isAuthenticated = !!user;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Si se especifica un tipo de usuario requerido, verificarlo
    // Asumiendo: 1 = INTERNO, 2 = EXTERNO
    if (requiredUserType && user?.userType !== requiredUserType) {
        // Redirigir al dashboard correspondiente si el tipo no coincide
        if (user?.userType === 1) { // INTERNO
            return <Navigate to="/dashboard-interno" replace />;
        } else if (user?.userType === 2) { // EXTERNO
            return <Navigate to="/dashboard-externo" replace />;
        } else {
            // Si el tipo no es conocido, redirigir a login
            return <Navigate to="/login" replace />;
        }
    }
    
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Ruta pública - Login */}
                    <Route path="/login" element={<LoginGeneral />} />
                    
                    {/* Ruta protegida - Dashboard para usuario interno */}
                    <Route 
                        path="/dashboard-interno" 
                        element={
                            <ProtectedRoute requiredUserType={1}>
                                <DashboardInterno />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Ruta protegida - Dashboard para usuario externo */}
                    <Route 
                        path="/dashboard-externo" 
                        element={
                            <ProtectedRoute requiredUserType={2}>
                                <DashboardExterno />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Redirigir a login por defecto si no está autenticado */}
                    {/* O al dashboard correspondiente si sí lo está */}
                    <Route path="/" element={<NavigateToDashboardOrLogin />} />
                    
                    {/* Ruta de fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

// Componente auxiliar para redirigir en la ruta raíz
const NavigateToDashboardOrLogin = () => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.userType === 1) {
        return <Navigate to="/dashboard-interno" replace />;
    }
    if (user.userType === 2) {
        return <Navigate to="/dashboard-externo" replace />;
    }
    return <Navigate to="/login" replace />; // Fallback
}

export default App; 