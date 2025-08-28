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
  },

  isTokenValid: (token) => {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decoded.exp && decoded.exp < currentTime) {
        console.log('Token JWT expirado');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validando token JWT:', error);
      return false;
    }
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
    
    try {
      // Limpiar localStorage de manera más eficiente
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Error removiendo ${key} del localStorage:`, error);
        }
      });
      
      // Limpiar sessionStorage
      try {
        sessionStorage.removeItem(STORAGE_KEYS.NEGOCIO);
        sessionStorage.clear();
      } catch (error) {
        console.warn('Error limpiando sessionStorage:', error);
      }
      
      // Limpiar localStorage completamente como respaldo
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Error limpiando localStorage completamente:', error);
      }
    } catch (error) {
      console.error('Error durante la limpieza:', error);
    }
    
    // Resetear estado
    setState(initialState);
    
    // Establecer status como deslogueado
    try {
      storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);
    } catch (error) {
      console.warn('Error estableciendo status de logout:', error);
    }
    
    // Navegar a login
    try {
      navigate('/login', { replace: true });
      console.log('Cleanup completado, redirigido a login');
    } catch (error) {
      console.error('Error navegando a login:', error);
      // Fallback usando window.location
      window.location.href = '/login';
    }
  }, [navigate, updateState]);

  // Función auxiliar para realizar logout con reintentos
  const performLogoutRequest = useCallback(async (retries = 0) => {
    // Para logout, no hacemos reintentos por defecto ya que lo importante es limpiar el estado local
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Usar el endpoint correcto según el README: POST /api/auth/logout-cookie
        // Este endpoint maneja la invalidación de cookies en el servidor
        await axiosInstance.post('/api/auth/logout-cookie', {}, {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 5000 // 5 segundos de timeout
        });
        return { success: true };
      } catch (error) {
        console.error(`Intento ${attempt + 1} de logout falló:`, error);

        // Si es un error 401 (no autorizado), el usuario ya está deslogueado en el servidor
        // En este caso, procedemos con el logout localmente sin más reintentos
        if (error?.response?.status === 401) {
          console.log('Usuario ya deslogueado en el servidor (401), procediendo con logout local');
          return { success: true };
        }

        // Para errores de red o de servidor, solo reintentamos una vez
        if (attempt === retries) {
          // Obtener mensaje de error específico del servidor si está disponible
          const errorMessage = error?.response?.data?.message ||
                              error?.response?.data?.Message ||
                              error?.message ||
                              'Error al cerrar sesión en el servidor';
          return {
            success: false,
            error: errorMessage
          };
        }

        // Esperar antes del siguiente intento (solo para errores de red)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }, []);

  // Logout confirmado por el usuario
  const confirmLogout = useCallback(async () => {
    updateState({ loading: true, error: null });
    storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);

    try {
      // Solo un reintento para logout confirmado
      const result = await performLogoutRequest(1);

      if (result.success) {
        updateState({ isLogoutModalOpen: false, error: null, loading: false });
        cleanupAndRedirect();
      } else {
        console.error('Error al cerrar sesión:', result.error);
        updateState({
          error: result.error || 'Error desconocido al cerrar sesión',
          loading: false,
          isLogoutModalOpen: false
        });
        // Ejecutar cleanup después de un breve delay para mostrar el error
        setTimeout(() => {
          cleanupAndRedirect();
        }, 3000);
      }
    } catch (error) {
      console.error('Error inesperado en confirmLogout:', error);
      updateState({
        error: error.message || 'Error inesperado al cerrar sesión',
        loading: false,
        isLogoutModalOpen: false
      });
      setTimeout(() => {
        cleanupAndRedirect();
      }, 3000);
    }
  }, [performLogoutRequest, cleanupAndRedirect, updateState]);

  // Logout directo (sin confirmación)
  const directLogout = useCallback(async () => {
    try {
      updateState({ loading: true });
      storageUtils.setItem(STORAGE_KEYS.STATUS, STATUS_CODES.UNAUTHENTICATED);

      // Para logout directo, no hacemos reintentos
      const result = await performLogoutRequest(0);
      if (!result.success) {
        console.error('Error en logout directo:', result.error);
        updateState({
          error: result.error || 'Error desconocido en logout directo',
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error inesperado en logout directo:', error);
      updateState({
        error: error.message || 'Error inesperado en logout directo',
        loading: false,
      });
    } finally {
      cleanupAndRedirect();
    }
  }, [performLogoutRequest, cleanupAndRedirect, updateState]);

  // Mostrar modal de confirmación de logout
  const logout = useCallback(() => {
    // Verificar si el usuario está autenticado antes de mostrar el modal
    const currentStatus = storageUtils.getItem(STORAGE_KEYS.STATUS);
    const currentUser = storageUtils.getItem(STORAGE_KEYS.USER_DATA, true);
    const currentToken = storageUtils.getItem(STORAGE_KEYS.TOKEN);
    
    // Validaciones múltiples para asegurar que el usuario está realmente autenticado
    const isAuthenticated = (
      currentStatus === STATUS_CODES.AUTHENTICATED && 
      currentUser && 
      currentToken && 
      userDataUtils.isTokenValid(currentToken)
    );
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado o token inválido, redirigiendo directamente');
      cleanupAndRedirect();
      return;
    }
    
    updateState({ isLogoutModalOpen: true });
  }, [updateState, cleanupAndRedirect]);

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