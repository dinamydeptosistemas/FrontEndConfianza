import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axios';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from 'react-router-dom';
import TimeoutModal from '../components/modals/TimeoutModal';
import SessionTimeoutHandler from '../components/SessionTimeoutHandler';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos

const publicRoutes = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo', '/validate-email'];

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
    const isAuthenticated = !!user;

    const keepAlive = async () => {
        try {
            // TODO: Move this to authService.js
            await axiosInstance.post('/auth/keep-alive');
        } catch (error) {
            console.error('Error in keepAlive:', error);
            throw error; // Propagate error to be handled by the caller
        }
    };
    const navigate = useNavigate();
    const location = useLocation();

    const cleanupAndRedirect = useCallback(() => {
        console.log('Ejecutando cleanup y redirección...');
        setLoading(true);
        
        // Limpiar datos específicos
        localStorage.removeItem('negocio');
        localStorage.removeItem('userData');
        localStorage.removeItem('status');
        sessionStorage.removeItem('negocio');
        
        // Limpiar todo el localStorage como fallback
        localStorage.clear();
        
        // Resetear estados
        setUser(null);
        setNegocio(null);
        setError(null);
        setIsLogoutModalOpen(false);
        setIsInitialized(false);
        setLastActivity(Date.now());
        
        // Establecer status como deslogueado
        localStorage.setItem('status', '404');
        
        navigate('/login');
        setLoading(false);
        console.log('Cleanup completado, redirigido a login');
    }, [navigate]);

    useEffect(() => {
        let keepAliveInterval;

        if (isAuthenticated) {
            // Iniciar el temporizador para mantener la sesión activa
            keepAliveInterval = setInterval(() => {
                console.log('Sending keep-alive signal...');
                keepAlive().catch(error => {
                    console.error('Failed to send keep-alive signal:', error);
                    // Solo cerrar sesión si el error indica token expirado o no autorizado (401)
                    if (error?.response?.status === 401) {
                        console.warn('Token expirado. Cerrando sesión.');
                        cleanupAndRedirect();
                    } else {
                        // Para otros errores, simplemente registrar y continuar;
                        // La siguiente llamada keep-alive intentará de nuevo.
                    }
                });
            }, 90000); // Cada 90 segundos (1.5 minutos)
        }

        // Limpiar el intervalo cuando el componente se desmonte o el usuario se desloguee
        return () => {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
            }
        };
        }, [isAuthenticated, cleanupAndRedirect]); // Depende del estado de autenticación

   
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
                // Extraer datos del objeto Data anidado
                const responseData = response.data.Data || response.data;
                
                let claims = {};
                // Usar el JWT del nivel raíz (response.data.TokenSession) en lugar del GUID de response.data.Data.TokenSession
                const jwtToken = response.data.TokenSession;
                if (jwtToken && jwtToken.includes('.')) { // Verificar que sea un JWT válido (contiene puntos)
                    try {
                        claims = jwtDecode(jwtToken);
                        console.log('Token decodificado:', claims);
                    } catch (e) {
                        console.error('Error al decodificar el token:', e);
                        claims = {};
                    }
                }
                
                // Combinar datos: JWT claims + datos del usuario + respuesta completa
                const userData = { ...responseData, ...response.data, ...claims };
                console.log('Datos del usuario después de combinar:', userData);
                
                const normalizedUser = {
                    ...userData,
                    UserId: userData.UserID || userData.UserId || userData.userId,
                    UserType: userData.TipoUsuario || userData.UserType || userData.userType,
                    UserFunction: userData.UserFunction || userData.userFunction,
                    CodeFunction: userData.CodeFunction || userData.codeFunction,
                    NameEntity: userData.NameEntity || userData.nameEntity,
                    StatusCode: userData.StatusCode || userData.statusCode || 200,
                    Username: userData.Username || userData.username,
                    LoginMessage: userData.LoginMessage || userData.loginMessage || 'Inicio de sesión exitoso',
                    // Mantener ambos tokens para diferentes propósitos
                    JWTToken: response.data.TokenSession, // El JWT real
                    SessionToken: userData.TokenSession   // El GUID de sesión
                };

                console.log('Usuario normalizado en login:', normalizedUser);
                setUser(normalizedUser);
                // Guardar token para que otros servicios lo usen
                if (response.data.TokenSession) {
                    localStorage.setItem('token', response.data.TokenSession);
                }
                localStorage.setItem('status', '200');
                localStorage.setItem('userData', JSON.stringify(normalizedUser));
                
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
            console.log('Verificando usuario actual - Ruta:', location.pathname, '¿Es pública?', publicRoutes.includes(location.pathname));
            
            // Restaurar negocio del localStorage si existe
            const storedNegocio = localStorage.getItem('negocio');
            if (storedNegocio) {
                try {
                    const negocioData = JSON.parse(storedNegocio);
                    setNegocio(negocioData);
                } catch (e) {
                    console.error('Error al parsear negocio del localStorage:', e);
                }
            }

            // Verificar si ya tenemos un usuario válido en localStorage
            const storedStatus = localStorage.getItem('status');
            const storedUserData = localStorage.getItem('userData');
            
            if (storedStatus === '200' && storedUserData) {
                try {
                    const userData = JSON.parse(storedUserData);
                    console.log('Usuario encontrado en localStorage:', userData);
                    setUser(userData);
                    setLoading(false);
                    setIsInitialized(true);
                    return;
                } catch (e) {
                    console.error('Error al parsear datos de usuario del localStorage:', e);
                }
            }

            console.log('Consultando usuario actual al servidor...');
            const response = await axiosInstance.get('/api/auth/current-user', {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            console.log('Respuesta del servidor para current-user:', response.data);

            if (
                response.status === 200 ||
                response.data.StatusCode === 200 || response.data.statusCode === 200 ||
                response.data.Success || response.data.success ||
                response.data.LoginMessage === 'Sesión válida' || response.data.LoginMessage === 'Inicio de sesión exitoso'
            ) {
                // Extraer datos del objeto Data anidado
                const responseData = response.data.Data || response.data;
                
                let claims = {};
                // Usar el JWT del nivel raíz si está disponible
                const jwtToken = response.data.TokenSession;
                if (jwtToken && typeof jwtToken === 'string' && jwtToken.includes('.')) {
                    try {
                        claims = jwtDecode(jwtToken);
                        console.log('Token JWT decodificado exitosamente:', claims);
                    } catch (e) {
                        console.warn('No se pudo decodificar el token JWT:', e);
                        claims = {};
                    }
                }

                const userData = { ...responseData, ...response.data, ...claims };
                const normalizedUser = {
                    ...userData,
                    UserId: userData.UserId || userData.userId || userData.UserID,
                    UserType: userData.UserType || userData.userType || userData.TipoUsuario,
                    UserFunction: userData.UserFunction || userData.userFunction,
                    CodeFunction: userData.CodeFunction || userData.codeFunction,
                    NameEntity: userData.NameEntity || userData.nameEntity,
                    StatusCode: userData.StatusCode || userData.statusCode || 200,
                    Username: userData.Username || userData.username,
                    LoginMessage: userData.LoginMessage || userData.loginMessage || 'Sesión válida'
                };

                console.log('Usuario normalizado:', normalizedUser);
                setUser(normalizedUser);
                // Guardar token si viene en la respuesta
                if (response.data.TokenSession) {
                    localStorage.setItem('token', response.data.TokenSession);
                }
                localStorage.setItem('status', '200');
                localStorage.setItem('userData', JSON.stringify(normalizedUser));

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
                console.log('Respuesta del servidor indica sesión inválida');
                if (!publicRoutes.includes(location.pathname)) {
                    console.log('Redirigiendo a login por sesión inválida');
                    cleanupAndRedirect();
                }
            }
        } catch (error) {
            console.error('Error al verificar usuario actual:', error);
            
            // Solo redirigir si es un error 401 y no estamos en una ruta pública
            if (error?.response?.status === 401) {
                // Intentar usar datos almacenados antes de redirigir
                const storedStatus = localStorage.getItem('status');
                const storedUserData = localStorage.getItem('userData');

                if (storedStatus === '200' && storedUserData) {
                    try {
                        const userData = JSON.parse(storedUserData);
                        console.warn('Error 401 recibido; utilizando datos locales para mantener la sesión.');
                        setUser(userData);
                        return; // Evitar redirección
                    } catch (e) {
                        console.error('Error al parsear datos locales tras 401:', e);
                    }
                }

                if (!publicRoutes.includes(location.pathname)) {
                    console.log('Error 401 sin datos locales válidos - Redirigiendo a login');
                    cleanupAndRedirect();
                }
            } else if (!publicRoutes.includes(location.pathname)) {
                // Para otros errores, intentar usar datos del localStorage si existen
                const storedStatus = localStorage.getItem('status');
                const storedUserData = localStorage.getItem('userData');
                
                if (storedStatus === '200' && storedUserData) {
                    try {
                        const userData = JSON.parse(storedUserData);
                        console.log('Usando datos de usuario del localStorage como fallback');
                        setUser(userData);
                    } catch (e) {
                        console.error('Error al usar fallback del localStorage:', e);
                        cleanupAndRedirect();
                    }
                }
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