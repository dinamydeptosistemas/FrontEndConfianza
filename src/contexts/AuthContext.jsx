import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

import axiosInstance from '../config/axios';
import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';
import TimeoutModal from '../components/modals/TimeoutModal';
import WorkActivityMonitor from '../components/WorkActivityMonitor';

// Constantes para mejor mantenimiento
const STORAGE_KEYS = {
  STATUS: 'status',
  USER_DATA: 'userData',
  NEGOCIO: 'negocio',
  TOKEN: 'token'
};

const STATUS_CODES = {
  AUTHENTICATED: '200',
  UNAUTHENTICATED: '404'
};

const PUBLIC_ROUTES = [
  '/login', 
  '/registrar-usuario-interno', 
  '/registrar-usuario-externo', 
  '/validate-email'
];

// Utilidades para manejo de storage
const storageUtils = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    } catch (error) {
      console.error(`Error guardando en localStorage (${key}):`, error);
    }
  },

  getItem: (key, parse = false) => {
    try {
      const item = localStorage.getItem(key);
      return parse && item ? JSON.parse(item) : item;
    } catch (error) {
      console.error(`Error leyendo de localStorage (${key}):`, error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando de localStorage (${key}):`, error);
    }
  },

  clearAll: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
  }
};

// Utilidades para normalización de datos de usuario
const userDataUtils = {
  normalizeUserData: (responseData, jwtClaims = {}) => {
    const userData = { ...responseData, ...jwtClaims };
    
    return {
      ...userData,
      UserId: userData.UserID || userData.UserId || userData.userId,
      UserType: userData.TipoUsuario || userData.UserType || userData.userType,
      UserFunction: userData.UserFunction || userData.userFunction,
      CodeFunction: userData.CodeFunction || userData.codeFunction,
      NameEntity: userData.NameEntity || userData.nameEntity,
      StatusCode: userData.StatusCode || userData.statusCode || 200,
      Username: userData.Username || userData.username,
      LoginMessage: userData.LoginMessage || userData.loginMessage || 'Sesión válida'
    };
  },

  decodeJwtToken: (token) => {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return {};
    }

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return {};
    }
  },

  extractNegocioData: (userData) => {
    if (!userData.NameEntity) return null;
    
    return {
      nombre: userData.NameEntity,
      codigo: userData.CodeEntity
    };
  }
};

// Context y hook personalizado
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Estado inicial
const initialState = {
  user: null,
  negocio: null,
  loading: true,
  error: null,
  isLogoutModalOpen: false,
  isInitialized: false,
  showTimeoutModal: false
};

export const AuthProvider = ({ children }) => {
  // Estados principales
  const [state, setState] = useState(initialState);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Función para actualizar estado de manera controlada
  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Limpieza completa del estado y redirección
  const cleanupAndRedirect = useCallback(() => {
    console.log('Ejecutando cleanup y redirección...');
    
    updateState({ loading: true });
    
    // Limpiar localStorage
    Object.values(STORAGE_KEYS).forEach(key => storageUtils.removeItem(key));
    sessionStorage.removeItem(STORAGE_KEYS.NEGOCIO);
    storageUtils.clearAll();
    
    // Resetear estado
    setState(initialState);
    
    // Establecer status como deslogueado
    storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);
    
    navigate('/login');
    console.log('Cleanup completado, redirigido a login');
  }, [navigate, updateState]);

  // Logout confirmado por el usuario
  const confirmLogout = useCallback(async () => {
    updateState({ loading: true, error: null });
    storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);
    
    try {
      await axiosInstance.post('/api/Auth/logout-cookie', null, {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      updateState({ isLogoutModalOpen: false });
      cleanupAndRedirect();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      updateState({ 
        error: error?.response?.data?.Message || 'Error al cerrar sesión', 
        loading: false 
      });
    }
  }, [cleanupAndRedirect, updateState]);

  // Logout directo (sin confirmación)
  const directLogout = useCallback(async () => {
    try {
      updateState({ loading: true });
      storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);
      
      await axiosInstance.post('/api/Auth/logout-cookie', null, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      cleanupAndRedirect();
    }
  }, [cleanupAndRedirect, updateState]);

  // Mostrar modal de confirmación de logout
  const logout = useCallback(() => {
    updateState({ isLogoutModalOpen: true });
  }, [updateState]);

  // Cancelar logout
  const cancelLogout = useCallback(() => {
    updateState({ 
      isLogoutModalOpen: false, 
      error: null 
    });
  }, [updateState]);

  // Función de login
  const login = useCallback(async (credentials) => {
    try {
      console.log('Iniciando proceso de login');
      updateState({ loading: true, error: null });
      
      const response = await axiosInstance.post('/api/auth/login', credentials, {
        withCredentials: true
      });
      
      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Error en la autenticación');
      }

      const responseData = response.data.Data || response.data;
      const jwtToken = response.data.TokenSession;
      const jwtClaims = userDataUtils.decodeJwtToken(jwtToken);
      
      // Normalizar datos del usuario
      const normalizedUser = userDataUtils.normalizeUserData(responseData, {
        ...response.data,
        ...jwtClaims,
        JWTToken: jwtToken,
        SessionToken: responseData.TokenSession
      });

      // Actualizar estado
      updateState({ user: normalizedUser });
      
      // Guardar en localStorage
      if (jwtToken) {
        storageUtils.setItem(STORAGE_KEYS.TOKEN, jwtToken);
      }
      storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.AUTHENTICATED);
      storageUtils.setItem(STORAGE_KEYS.USER_DATA, normalizedUser);
      
      // Manejar datos del negocio
      const negocioData = userDataUtils.extractNegocioData(normalizedUser);
      if (negocioData) {
        updateState({ negocio: negocioData });
        storageUtils.setItem(STORAGE_KEYS.NEGOCIO, negocioData);
        sessionStorage.setItem(STORAGE_KEYS.NEGOCIO, JSON.stringify(negocioData));
      }
      
      return normalizedUser;
      
    } catch (error) {
      const errorMessage = error.response?.data?.Message || 'Error en la autenticación';
      updateState({ error: errorMessage });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  }, [updateState]);

  // Funciones auxiliares para fetchCurrentUser
  const restoreStoredData = useCallback(() => {
    const storedNegocio = storageUtils.getItem(STORAGE_KEYS.NEGOCIO, true);
    if (storedNegocio) {
      updateState({ negocio: storedNegocio });
    }

    const storedStatus = storageUtils.getItem(STORAGE_KEYS.STATUS);
    const storedUserData = storageUtils.getItem(STORAGE_KEYS.USER_DATA, true);
    
    if (storedStatus === STATUS_CODES.AUTHENTICATED && storedUserData) {
      console.log('Usuario encontrado en localStorage');
      updateState({ 
        user: storedUserData, 
        loading: false, 
        isInitialized: true 
      });
      return true;
    }
    return false;
  }, [updateState]);

  const processServerResponse = useCallback((response) => {
    const isValidResponse = (
      response.status === 200 ||
      response.data.StatusCode === 200 || 
      response.data.statusCode === 200 ||
      response.data.Success || 
      response.data.success ||
      response.data.LoginMessage === 'Sesión válida' || 
      response.data.LoginMessage === 'Inicio de sesión exitoso'
    );

    if (!isValidResponse) return false;

    const responseData = response.data.Data || response.data;
    const jwtToken = response.data.TokenSession;
    const jwtClaims = userDataUtils.decodeJwtToken(jwtToken);
    
    const normalizedUser = userDataUtils.normalizeUserData({
      ...responseData,
      ...response.data,
      ...jwtClaims
    });

    // Actualizar estado y localStorage
    updateState({ user: normalizedUser });
    
    if (jwtToken) {
      storageUtils.setItem(STORAGE_KEYS.TOKEN, jwtToken);
    }
    storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.AUTHENTICATED);
    storageUtils.setItem(STORAGE_KEYS.USER_DATA, normalizedUser);

    // Manejar negocio
    const negocioData = userDataUtils.extractNegocioData(normalizedUser);
    if (negocioData) {
      updateState({ negocio: negocioData });
      storageUtils.setItem(STORAGE_KEYS.NEGOCIO, negocioData);
      try {
        sessionStorage.setItem(STORAGE_KEYS.NEGOCIO, JSON.stringify(negocioData));
      } catch (error) {
        console.error('Error guardando en sessionStorage:', error);
      }
    }
    
    return true;
  }, [updateState]);

  const handleFetchError = useCallback((error) => {
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
    const isUnauthorized = error?.response?.status === 401;
    
    if (isUnauthorized) {
      // Intentar usar datos almacenados como fallback
      const storedStatus = storageUtils.getItem(STORAGE_KEYS.STATUS);
      const storedUserData = storageUtils.getItem(STORAGE_KEYS.USER_DATA, true);

      if (storedStatus === STATUS_CODES.AUTHENTICATED && storedUserData) {
        console.warn('Error 401 - usando datos locales como fallback');
        updateState({ user: storedUserData });
        return;
      }

      if (!isPublicRoute) {
        console.log('Error 401 sin datos locales válidos - redirigiendo');
        cleanupAndRedirect();
      }
    } else if (!isPublicRoute) {
      // Para otros errores, intentar usar localStorage como fallback
      const storedStatus = storageUtils.getItem(STORAGE_KEYS.STATUS);
      const storedUserData = storageUtils.getItem(STORAGE_KEYS.USER_DATA, true);
      
      if (storedStatus === STATUS_CODES.AUTHENTICATED && storedUserData) {
        console.log('Usando datos del localStorage como fallback');
        updateState({ user: storedUserData });
      } else {
        cleanupAndRedirect();
      }
    }
  }, [location.pathname, updateState, cleanupAndRedirect]);

  // Verificar usuario actual (función principal simplificada)
  const fetchCurrentUser = useCallback(async () => {
    try {
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
      console.log(`Verificando usuario - Ruta: ${location.pathname}, ¿Pública?: ${isPublicRoute}`);
      
      // Intentar restaurar datos almacenados
      if (restoreStoredData()) {
        return;
      }

      // Consultar al servidor
      console.log('Consultando usuario actual al servidor...');
      const response = await axiosInstance.get('/api/auth/current-user', {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const processed = processServerResponse(response);
      if (!processed && !isPublicRoute) {
        console.log('Respuesta del servidor indica sesión inválida');
        cleanupAndRedirect();
      }
      
    } catch (error) {
      console.error('Error al verificar usuario actual:', error);
      handleFetchError(error);
    } finally {
      updateState({ 
        loading: false, 
        isInitialized: true 
      });
    }
  }, [location.pathname, restoreStoredData, processServerResponse, handleFetchError, cleanupAndRedirect, updateState]);

  // Handlers para modal de timeout
  const handleShowTimeoutModal = useCallback(() => {
    if (!PUBLIC_ROUTES.includes(location.pathname)) {
      updateState({ showTimeoutModal: true });
    }
  }, [location.pathname, updateState]);

  const handleContinueTimeout = useCallback(() => {
    updateState({ showTimeoutModal: false });
    // Reiniciar el timeout manualmente
    window.dispatchEvent(new Event('mousedown'));
  }, [updateState]);

  const handleLogoutTimeout = useCallback(() => {
    updateState({ showTimeoutModal: false });
    directLogout();
  }, [directLogout, updateState]);

  // Efecto para verificación inicial de sesión
  useEffect(() => {
    const checkSession = async () => {
      const status = storageUtils.getItem(STORAGE_KEYS.STATUS);
      if (status === STATUS_CODES.UNAUTHENTICATED) {
        updateState({ 
          loading: false, 
          isInitialized: true 
        });
        return;
      }
      await fetchCurrentUser();
    };
    
    checkSession();
  }, [fetchCurrentUser, updateState]);

  // Valor del contexto (memoizado para evitar re-renders innecesarios)
  const contextValue = useMemo(() => ({
    user: state.user,
    negocio: state.negocio,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,
    login,
    logout,
    directLogout,
    confirmLogout,
    cleanupAndRedirect,
    fetchCurrentUser,
    showTimeoutModal: handleShowTimeoutModal,
    handleContinueTimeout,
    handleLogoutTimeout,
    isTimeoutModalOpen: state.showTimeoutModal
  }), [
    state.user,
    state.negocio, 
    state.loading,
    state.error,
    state.isInitialized,
    state.showTimeoutModal,
    login,
    logout,
    directLogout,
    confirmLogout,
    cleanupAndRedirect,
    fetchCurrentUser,
    handleShowTimeoutModal,
    handleContinueTimeout,
    handleLogoutTimeout
  ]);

  // No renderizar hasta estar inicializado
  if (!state.isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <WorkActivityMonitor />
      {children}
      <LogoutConfirmModal
        isOpen={state.isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        error={state.error}
        loading={state.loading}
      />
      <TimeoutModal
        open={state.showTimeoutModal}
        onContinue={handleContinueTimeout}
        onLogout={handleLogoutTimeout}
      />
    </AuthContext.Provider>
  );
};

// Validación de PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;