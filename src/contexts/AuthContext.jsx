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
        // Limpiar estado
        setUser(null);
        setError(null);
        setIsLogoutModalOpen(false);

        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('negocio');

        // Limpiar cookies
        document.cookie.split(";").forEach(cookie => {
            const [name] = cookie.split("=");
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        // Verificar que todo se haya limpiado
        const isClean = !localStorage.getItem('token') && 
                       !localStorage.getItem('user') && 
                       !localStorage.getItem('lastActivity') &&
                       !localStorage.getItem('negocio');

        if (isClean) {
            window.location.href = '/login';
        } else {
            console.error('No se pudo limpiar completamente la sesión');
            // Intentar limpiar todo de nuevo
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    const confirmLogout = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                // Si no hay usuario, solo redirigir
                window.location.href = '/login';
                return;
            }

            // El servicio manejará la limpieza y redirección
            await authService.logout({
                ventanaInicio: window.location.pathname
            });

        } catch (error) {
            console.error('Error en logout:', error);
            // No necesitamos manejar el error aquí ya que el servicio
            // se encarga de la limpieza y redirección
        }
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
        setError(null);
    };

    const initiateLogout = () => {
        setIsLogoutModalOpen(true);
        setError(null);
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
        logout: initiateLogout,
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