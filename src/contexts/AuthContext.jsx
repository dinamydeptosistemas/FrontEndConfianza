import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth/authService';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const cleanupAndRedirect = () => {
        setUser(null);
        setError(null);
        setIsLogoutModalOpen(false);
        localStorage.clear();
        window.location.href = '/login';
    };

    const logout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                cleanupAndRedirect();
                return;
            }

            const response = await authService.logout({
                userId: currentUser.userId,
                userType: currentUser.userType,
                ventanaInicio: window.location.pathname
            });

            if (response.success) {
                cleanupAndRedirect();
            } else {
                throw new Error(response.message || 'Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error en logout:', error);
            setError(error.message || 'Error al cerrar sesión');
        } finally {
            setLoading(false);
        }
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    try {
                        const tokenResponse = await authService.verifyToken();
                        if (tokenResponse.valid) {
                            setUser(currentUser);
                        } else {
                            cleanupAndRedirect();
                        }
                    } catch (error) {
                        cleanupAndRedirect();
                    }
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const currentPath = window.location.pathname;
            const response = await authService.login({ ...credentials, ventanaInicio: currentPath });

            if (response && response.userId) {
                const userToSave = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    userType: credentials.userType,
                    permissions: response.permissions
                };
                setUser(userToSave);
                localStorage.setItem('user', JSON.stringify(userToSave));
                return response;
            } else {
                throw new Error(response?.message || 'Error en la autenticación');
            }
        } catch (error) {
            setError(error.message);
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
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
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
                error={error}
                loading={loading}
            />
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