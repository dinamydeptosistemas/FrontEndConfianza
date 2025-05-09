import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axios';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [negocio, setNegocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    const cleanupAndRedirect = useCallback(() => {
        setLoading(true);
        localStorage.removeItem('negocio');
        sessionStorage.removeItem('negocio');
        localStorage.clear();
        setUser(null);
        setNegocio(null);
        setError(null);
        setIsLogoutModalOpen(false);
        setIsInitialized(false);
        navigate('/login');
        setLoading(false);
    }, [navigate]);

    const confirmLogout = useCallback(async () => {
        setLoading(true);
        setError(null);
        localStorage.setItem('status', '404');
        try {
            await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setIsLogoutModalOpen(false);
            cleanupAndRedirect();
        } catch (error) {
            setError('Error al cerrar sesión');
            setLoading(false);
        }
    }, [cleanupAndRedirect]);

    const directLogout = async () => {
        try {
            setLoading(true);
            localStorage.setItem('status', '404');
            await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true
            });
            cleanupAndRedirect();
        } catch (error) {
            localStorage.setItem('status', '404');
            cleanupAndRedirect();
        }
    };

    const handleInactivityLogout = useCallback(async () => {
        try {
            setLoading(true);
            await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true
            });
            localStorage.setItem('status', '404');
            cleanupAndRedirect();
        } catch (error) {
            cleanupAndRedirect();
        }
    }, [cleanupAndRedirect]);

    // Monitorear actividad del usuario
    useEffect(() => {
        if (!isInitialized) return;

        const updateActivity = () => setLastActivity(Date.now());
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        const checkInactivity = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (user && timeSinceLastActivity > INACTIVITY_TIMEOUT) {
                handleInactivityLogout();
            }
        }, 60000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(checkInactivity);
        };
    }, [user, lastActivity, handleInactivityLogout, isInitialized]);

    const logout = () => {
        setIsLogoutModalOpen(true);
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
        setError(null);
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.post('/api/auth/login', credentials, {
                withCredentials: true
            });
            
            if (response.data.Success) {
                let claims = {};
                if (response.data.TokenSession) {
                    try {
                        claims = jwtDecode(response.data.TokenSession);
                    } catch (e) {
                        claims = {};
                    }
                }
                
                const userData = { ...response.data, ...claims };
                const normalizedUser = {
                    ...userData,
                    UserId: userData.UserId || userData.userId,
                    UserType: userData.UserType || userData.userType,
                    UserFunction: userData.UserFunction || userData.userFunction,
                    CodeFunction: userData.CodeFunction || userData.codeFunction,
                    StatusCode: userData.StatusCode || userData.statusCode,
                    Username: userData.Username || userData.username,
                };

                setUser(normalizedUser);
                localStorage.setItem('status', '200');
                
                if (response.data.NameEntity) {
                    const negocioData = {
                        nombre: response.data.NameEntity,
                        codigo: response.data.CodeEntity
                    };
                    localStorage.setItem('negocio', JSON.stringify(negocioData));
                    sessionStorage.setItem('negocio', JSON.stringify(negocioData));
                }
                
                return normalizedUser;
            } else {
                throw new Error(response.data.Message || 'Error en la autenticación');
            }
        } catch (error) {
            setError(error.response?.data?.Message || 'Error en la autenticación');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/auth/current-user', {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success || response.data.statusCode === 200) {
                let claims = {};
                if (response.data.TokenSession) {
                    try {
                        claims = jwtDecode(response.data.TokenSession);
                    } catch (e) {
                        claims = {};
                    }
                }

                const userData = { ...response.data, ...claims };
                const normalizedUser = {
                    ...userData,
                    UserId: userData.UserId || userData.userId,
                    UserType: userData.UserType || userData.userType,
                    UserFunction: userData.UserFunction || userData.userFunction,
                    CodeFunction: userData.CodeFunction || userData.codeFunction,
                    StatusCode: userData.StatusCode || userData.statusCode,
                    Username: userData.Username || userData.username,
                };

                setUser(normalizedUser);
                localStorage.setItem('status', '200');

                if (response.data.NameEntity) {
                    const negocioData = {
                        nombre: response.data.NameEntity,
                        codigo: response.data.CodeEntity
                    };
                    localStorage.setItem('negocio', JSON.stringify(negocioData));
                    sessionStorage.setItem('negocio', JSON.stringify(negocioData));
                }
            } else {
                cleanupAndRedirect();
            }
        } catch (error) {
            cleanupAndRedirect();
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }, [cleanupAndRedirect]);

    // Verificación inicial de sesión
    useEffect(() => {
        const checkSession = async () => {
            const status = localStorage.getItem('status');
            if (status === '404') {
                setLoading(false);
                setIsInitialized(true);
                return;
            }
            await fetchCurrentUser();
        };
        checkSession();
    }, [fetchCurrentUser]);

    const value = {
        user,
        negocio,
        loading,
        error,
        isInitialized,
        login,
        logout,
        directLogout,
        confirmLogout,
        cleanupAndRedirect,
        fetchCurrentUser
    };

    if (!isInitialized) {
        return null; // No renderizar nada hasta que la verificación inicial esté completa
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

export default AuthContext;