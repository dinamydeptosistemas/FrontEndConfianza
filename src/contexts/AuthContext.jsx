import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    await authService.verifyToken();
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            console.log('[AuthContext] Credenciales recibidas para login:', credentials);
            setError(null);
            const response = await authService.login(credentials);
            console.log('[AuthContext] Respuesta de authService.login:', response);

            if (response.success) {
                const userToSave = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    userType: credentials.userType
                };
                setUser(userToSave);
                localStorage.setItem('user', JSON.stringify(userToSave));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('[AuthContext] Error en la función login:', error);
            setError(error.message);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    };

    const hasPermission = (permission) => {
        return authService.hasPermission(permission);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        hasPermission
    };

    if (loading) {
        return <div>Cargando...</div>; // O tu componente de loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext; 