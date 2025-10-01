import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

import axiosInstance from '../config/axios';
import { useConfig } from './ConfigContext';

import { LogoutConfirmModal } from '../components/modals/LogoutConfirmModal';

// Constantes para mejor mantenimiento
const STORAGE_KEYS = {
  STATUS: 'status',
  USER_DATA: 'userData',
  NEGOCIO: 'negocio',
  TOKEN: 'token'
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
  normalizeUserData: (userData) => {
    return {
      ...userData,
      // Normaliza campos para consistencia en la aplicación
      UserId: userData.UserID || userData.UserId || userData.userId,
      UserType: userData.TipoUsuario || userData.UserType || userData.userType,
      UserFunction: userData.UserFunction || userData.userFunction,
      CodeFunction: userData.CodeFunction || userData.codeFunction,
      NameEntity: userData.NameEntity || userData.nameEntity,
      nombrecomerciallogin: userData.NameEntity || userData.nameEntity,
      StatusCode: userData.StatusCode || userData.statusCode || 200,
      Username: userData.Username || userData.username,
      LoginMessage: userData.LoginMessage || userData.loginMessage || 'Sesión válida',
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

// Utilidad para obtener el estado inicial desde localStorage
const getInitialAuthState = () => {
  try {
    const storedToken = storageUtils.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = storageUtils.getItem(STORAGE_KEYS.USER_DATA, true); // true para parsear JSON
    const storedNegocio = storageUtils.getItem(STORAGE_KEYS.NEGOCIO, true); // true para parsear JSON

    if (storedToken && storedUser && userDataUtils.isTokenValid(storedToken)) {
      return {
        user: storedUser,
        negocio: storedNegocio,
        loading: false,
        error: null,
        isLogoutModalOpen: false,
        isInitialized: true, // Se establece en true si se carga correctamente desde el almacenamiento
      };
    }
  } catch (error) {
    console.error("Error al cargar el estado de autenticación inicial desde el almacenamiento:", error);
    // Limpiar cualquier dato de almacenamiento corrupto
    storageUtils.clearAll();
  }
  return {
    user: null,
    negocio: null,
    loading: true, // Todavía cargando si no hay datos válidos en el almacenamiento
    error: null,
    isLogoutModalOpen: false,
    isInitialized: false,
  };
};

// Estado inicial
const initialState = getInitialAuthState();

export const AuthProvider = ({ children }) => {
    console.log('[AuthProvider] Renderizando...');
  // Estados principales
  const [state, setState] = useState(initialState);
  const { reloadConfig, clearConfig } = useConfig();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Función para actualizar estado de manera controlada
  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Limpieza completa del estado y redirección
  const cleanupAndRedirect = useCallback(() => {
    console.log('Ejecutando cleanup y redirección...');
    
    // Clear storage first
    try {
      sessionStorage.clear();
      localStorage.clear(); // This clears all localStorage, including non-auth related items
    } catch (error) {
      console.error('Error durante la limpieza de storage:', error);
    }
    
    // Reset state and ensure it's ready to render the login page
    setState({ 
      ...initialState, 
      user: null,
      negocio: null,
      loading: false, // Ensure loading is false for the login page
      isInitialized: true // Ensure AuthProvider renders its children
    });
    clearConfig(); // Clear config after state reset
    
    navigate('/login', { replace: true });
    console.log('Cleanup completado, redirigido a login');

  }, [navigate, clearConfig]);

  // Función auxiliar para realizar logout con reintentos
  const performLogoutRequest = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout-cookie', {}, { withCredentials: true });
      return { success: true };
    } catch (error) {
      console.error('Logout en servidor falló:', error);
      if (error?.response?.status === 401) {
        return { success: true }; // Ya está deslogueado en el servidor
      }
      return { success: false, error: error.message };
    }
  }, []);

  // Logout confirmado por el usuario
  const confirmLogout = useCallback(async () => {
    updateState({ loading: true, error: null });
    await performLogoutRequest();
    cleanupAndRedirect();
  }, [performLogoutRequest, cleanupAndRedirect, updateState]);

  // Logout directo (sin confirmación)
  const directLogout = useCallback(async () => {
    await performLogoutRequest();
    cleanupAndRedirect();
  }, [performLogoutRequest, cleanupAndRedirect]);

  // Mostrar modal de confirmación de logout
  const logout = useCallback(() => {
    const isAuthenticated = state.user && userDataUtils.isTokenValid(storageUtils.getItem(STORAGE_KEYS.TOKEN));
    if (!isAuthenticated) {
      cleanupAndRedirect();
      return;
    }
    updateState({ isLogoutModalOpen: true });
  }, [state.user, updateState, cleanupAndRedirect]);


  const setNegocio = useCallback((negocioData) => {
    if (negocioData) {
      updateState({ negocio: negocioData });
      storageUtils.setItem(STORAGE_KEYS.NEGOCIO, negocioData);
      sessionStorage.setItem(STORAGE_KEYS.NEGOCIO, JSON.stringify(negocioData));
    }
  }, [updateState]);

  // Función de login
  const login = useCallback(async (credentials) => {
    updateState({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials, { withCredentials: true });
      
      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Error en la autenticación');
      }

      const loginResponseData = response.data;
      const jwtToken = loginResponseData.TokenSession;
      const jwtClaims = userDataUtils.decodeJwtToken(jwtToken);

      // Consolida todos los datos en un solo objeto de usuario para el estado.
      // Esto asegura que todo lo de la respuesta se almacene.
      const userObject = {
        ...loginResponseData,
        ...(loginResponseData.Data || {}),
        ...jwtClaims
      };
      
      // Normaliza campos para consistencia, sin perder ningún dato.
      const normalizedUser = userDataUtils.normalizeUserData(userObject);

      updateState({ user: normalizedUser, loading: false, error: null });
      
      if (jwtToken) storageUtils.setItem(STORAGE_KEYS.TOKEN, jwtToken);
      storageUtils.setItem(STORAGE_KEYS.USER_DATA, normalizedUser);
      
      const negocioData = userDataUtils.extractNegocioData(normalizedUser);
      if (negocioData) setNegocio(negocioData);

      await reloadConfig();
      
      return normalizedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.Message || 'Error en la autenticación';
      updateState({ error: errorMessage, loading: false });
      throw error;
    } 
  }, [updateState, reloadConfig, setNegocio]);

  // Efecto para verificación inicial de sesión
  useEffect(() => {
    if (!state.isInitialized) {
        if (PUBLIC_ROUTES.includes(location.pathname)) {
            updateState({ loading: false, isInitialized: true });
        } else {
            const token = storageUtils.getItem(STORAGE_KEYS.TOKEN);
            if (!userDataUtils.isTokenValid(token)) {
                cleanupAndRedirect();
            } else {
                updateState({ loading: false, isInitialized: true });
            }
        }
    }
  }, [location.pathname, state.isInitialized, updateState, cleanupAndRedirect]);

  // Valor del contexto
  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    directLogout,
    confirmLogout,
    cleanupAndRedirect,
    setNegocio,
  }), [state, login, logout, directLogout, confirmLogout, cleanupAndRedirect, setNegocio]);

    console.log('[AuthProvider] Context Value:', contextValue);

  if (!state.isInitialized) {
    return null; // O un spinner de carga global
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <LogoutConfirmModal
        isOpen={state.isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={() => updateState({ isLogoutModalOpen: false })}
        loading={state.loading}
        error={state.error}
      />
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;