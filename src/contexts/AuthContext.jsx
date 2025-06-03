import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axios';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from 'react-router-dom';
import TimeoutModal from '../components/modals/TimeoutModal';
import SessionTimeoutHandler from '../components/SessionTimeoutHandler';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos

const publicRoutes = ['/login', '/registrar-usuario-interno'];

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
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const directLogout = useCallback(async () => {
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
    }, [cleanupAndRedirect]);

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
            console.log('Iniciando proceso de login con credenciales:', { ...credentials, password: '***' });
            setLoading(true);
            setError(null);
            const response = await axiosInstance.post('/api/auth/login', credentials, {
                withCredentials: true
            });
            
            console.log('Respuesta del login:', response.data);
            
            if (response.data.Success) {
                let claims = {};
                if (response.data.TokenSession) {
                    try {
                        claims = jwtDecode(response.data.TokenSession);
                        console.log('Token decodificado:', claims);
                    } catch (e) {
                        console.error('Error al decodificar el token:', e);
                        claims = {};
                    }
                }
                
                const userData = { ...response.data, ...claims };
                console.log('Datos del usuario después de combinar:', userData);
                const normalizedUser = {
                    ...userData,
                    UserId: userData.UserId || userData.userId,
                    UserType: userData.UserType || userData.userType,
                    UserFunction: userData.UserFunction || userData.userFunction,
                    CodeFunction: userData.CodeFunction || userData.codeFunction,
                    NameEntity: userData.NameEntity || userData.nameEntity,
                    StatusCode: userData.StatusCode || userData.statusCode,
                    Username: userData.Username || userData.username,
                };

                setUser(normalizedUser);
                localStorage.setItem('status', '200');
                
                if (normalizedUser.NameEntity) {
                    const negocioData = {
                        nombre: normalizedUser.NameEntity,
                        codigo: normalizedUser.CodeEntity
                    };
                    setNegocio(negocioData);
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
            console.log('Ruta actual:', location.pathname, '¿Es pública?', publicRoutes.includes(location.pathname));
            const storedNegocio = localStorage.getItem('negocio');
            if (storedNegocio) {
                try {
                    const negocioData = JSON.parse(storedNegocio);
                    setNegocio(negocioData);
                } catch (e) {
                    console.error('Error al parsear negocio del localStorage:', e);
                }
            }

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
                    NameEntity: userData.NameEntity || userData.nameEntity,
                    StatusCode: userData.StatusCode || userData.statusCode,
                    Username: userData.Username || userData.username,
                };

                setUser(normalizedUser);
                localStorage.setItem('status', '200');

                if (normalizedUser.NameEntity) {
                    const negocioData = {
                        nombre: normalizedUser.NameEntity,
                        codigo: normalizedUser.CodeEntity
                    };
                    setNegocio(negocioData);
                    localStorage.setItem('negocio', JSON.stringify(negocioData));
                    sessionStorage.setItem('negocio', JSON.stringify(negocioData));
                }
            } else {
                
                if (!publicRoutes.includes(location.pathname)) {
                    cleanupAndRedirect();
                }
            }
        } catch (error) {
           
            if (
                error?.response?.status === 401 &&
                !publicRoutes.includes(location.pathname)

            ) {
                cleanupAndRedirect();
            }
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }, [cleanupAndRedirect, location]);

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

    const handleShowTimeoutModal = useCallback(() => {
        if (!publicRoutes.includes(location.pathname)) {
            setShowTimeoutModal(true);
        }
    }, [location.pathname]);

    const handleContinueTimeout = useCallback(() => {
        setShowTimeoutModal(false);
        // Reiniciar el timeout manualmente
        const event = new Event('mousedown');
        window.dispatchEvent(event);
    }, []);

    const handleLogoutTimeout = useCallback(() => {
        setShowTimeoutModal(false);
        directLogout();
    }, [directLogout]);

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
        fetchCurrentUser,
        showTimeoutModal: handleShowTimeoutModal,
        handleContinueTimeout,
        handleLogoutTimeout,
        isTimeoutModalOpen: showTimeoutModal
    };

    if (!isInitialized) {
        return null;
    }

    return (
        <AuthContext.Provider value={value}>
            <SessionTimeoutHandler />
            {children}
            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
                error={error}
                loading={loading}
            />
            <TimeoutModal
                open={showTimeoutModal}
                onContinue={handleContinueTimeout}
                onLogout={handleLogoutTimeout}
            />
        </AuthContext.Provider>
    );
};

export default AuthContext;