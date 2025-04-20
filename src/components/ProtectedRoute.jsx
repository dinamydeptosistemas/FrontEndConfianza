import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredUserType }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Verificar el tipo de usuario si se especifica
    if (requiredUserType && user.userType !== requiredUserType) {
        // Redirigir al dashboard correspondiente según el tipo de usuario
        const redirectPath = user.userType === 1 ? '/dashboard-interno' : '/dashboard-externo';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute; 