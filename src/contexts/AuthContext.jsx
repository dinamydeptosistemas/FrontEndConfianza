import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axios';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';
import globalState from '../config/globalState';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [negocio, setNegocio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    const cleanupAndRedirect = useCallback(() => {
        console.log('Ejecutando cleanupAndRedirect');
        // Limpiar el estado global
        globalState.clearState();
        
        // Limpiar el estado local
        setUser(null);
        setNegocio(null);
        setError(null);
        setIsLogoutModalOpen(false);
        
        // Redirigir al login usando replace
        window.location.replace('/login');
    }, []);

    const confirmLogout = useCallback(async () => {
        console.log('Iniciando confirmLogout');
        try {
            setLoading(true);
            setError(null);

            // Llamar al endpoint de logout-cookie
            const response = await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true
            });

            console.log('Respuesta del logout-cookie:', response.data);
            setIsLogoutModalOpen(false);
            cleanupAndRedirect();
        } catch (error) {
            console.error('Error en confirmLogout:', error);
            setError(error.response?.data?.message || 'Error al cerrar sesión');
            cleanupAndRedirect(); // Aún redirigimos en caso de error
        } finally {
            setLoading(false);
        }
    }, [cleanupAndRedirect]);

    const directLogout = async () => {
        try {
            setLoading(true);
            await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true
            });
            cleanupAndRedirect();
        } catch (error) {
            console.error('Error en directLogout:', error);
            cleanupAndRedirect();
        } finally {
            setLoading(false);
        }
    };

    const handleInactivityLogout = useCallback(async () => {
        try {
            setLoading(true);
            await axiosInstance.post('/api/Auth/logout-cookie', null, {
                withCredentials: true
            });
            cleanupAndRedirect();
        } catch (error) {
            console.error('Error en handleInactivityLogout:', error);
            cleanupAndRedirect();
        } finally {
            setLoading(false);
        }
    }, [cleanupAndRedirect]);

    // Monitorear actividad del usuario
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        const checkInactivity = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (user && timeSinceLastActivity > INACTIVITY_TIMEOUT) {
                console.log('Sesión cerrada por inactividad');
                handleInactivityLogout();
            }
        }, 60000); // Revisar cada minuto

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(checkInactivity);
        };
    }, [user, lastActivity, handleInactivityLogout]);

    const logout = () => {
        console.log('Iniciando proceso de logout - abriendo modal');
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
            
            // Configurar axios para manejar cookies
            const response = await axiosInstance.post('/api/auth/login', credentials, {
                withCredentials: true
            });
            
            console.log('Respuesta del login:', response.data);
            
            if (response.data.Success) {
                // Guardar la respuesta completa en globalState
                globalState.setLoginResponse(response.data);
                
                const userData = {
                    userId: response.data.UserId,
                    username: response.data.Username,
                    userFunction: response.data.UserFunction,
                    codeFunction: response.data.CodeFunction,
                    codeEntity: response.data.CodeEntity,
                    nameEntity: response.data.NameEntity,
                    permissions: response.data.Permissions,
                    tipoUsuario: response.data.TipoUsuario,
                    estadousuario: response.data.estadousuario
                };
                
                console.log('Datos del usuario guardados:', userData);
                
                setUser(userData);
                setLastActivity(Date.now()); // Inicializar el tiempo de actividad
                globalState.setUser(userData);
                
                if (response.data.NameEntity) {
                    const negocioData = {
                        nombre: response.data.NameEntity,
                        codigo: response.data.CodeEntity
                    };
                    setNegocio(negocioData);
                    globalState.setNegocio(negocioData);
                }
                
                return response.data;
            } else {
                throw new Error(response.data.Message || 'Error en la autenticación');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || 'Error en la autenticación';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        negocio,
        loading,
        error,
        login,
        logout,
        directLogout,
        confirmLogout,
        cleanupAndRedirect
    };

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