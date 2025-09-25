import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

import axiosInstance from '../config/axios';
import { useConfig } from './ConfigContext';

import TimeoutModal from '../components/modals/TimeoutModal';

const FirstWarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
          <span className="text-2xl" aria-hidden="true">&times;</span>
        </button>
        <div className="flex items-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div> {/* Icono con Tailwind */}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Primer Aviso</h2>
            <p className="text-gray-600 text-sm">Tu sesión está próxima a expirar</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Para mantener tu sesión activa, confirma que sigues trabajando. Si no respondes, tu sesión se cerrará pronto.
          </p>
        </div>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

const SecondWarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
          <span className="text-2xl" aria-hidden="true">&times;</span>
        </button>
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div> {/* Icono con Tailwind */}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Segundo Aviso</h2>
            <p className="text-gray-600 text-sm">Tu sesión está a punto de expirar</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Tu sesión se cerrará muy pronto. Por favor, guarda cualquier trabajo pendiente para no perderlo.
          </p>
        </div>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionExpiredModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sesión Expirada</h2>
            <p className="text-gray-600 text-sm">Tu sesión ha finalizado.</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Por tu seguridad, la sesión se ha cerrado. Por favor, inicia sesión de nuevo.
          </p>
        </div>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FIN DE MODALES LOCALES ---


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
      UserId: userData.UserID || userData.UserId || userData.userId,
      UserType: userData.TipoUsuario || userData.UserType || userData.userType,
      UserFunction: userData.UserFunction || userData.userFunction,
      CodeFunction: userData.CodeFunction || userData.codeFunction,
      NameEntity: userData.NameEntity || userData.nameEntity,
      nombrecomerciallogin: userData.NameEntity || userData.nameEntity, // Added this line
      StatusCode: userData.StatusCode || userData.statusCode || 200,
      Username: userData.Username || userData.username,
      LoginMessage: userData.LoginMessage || userData.loginMessage || 'Sesión válida',
      // Explicitly add other fields from the 'Data' object in the example JSON
      AllowPermissions: userData.AllowPermissions,
      AllModulesAccess: userData.AllModulesAccess,
      AdministrationAccess: userData.AdministrationAccess,
      ProductAccess: userData.ProductAccess,
      InventoryAccess: userData.InventoryAccess,
      PurchaseAccess: userData.PurchaseAccess,
      SaleAccess: userData.SaleAccess,
      CashRegisterAccess: userData.CashRegisterAccess,
      BankAccess: userData.BankAccess,
      AccountingAccess: userData.AccountingAccess,
      PayrollAccess: userData.PayrollAccess,
      GeneralCashAccess: userData.GeneralCashAccess,
      GeneralCashCloseAccess: userData.GeneralCashCloseAccess,
      CashRegister001Access: userData.CashRegister001Access,
      CashRegister002Access: userData.CashRegister002Access,
      CashRegister003Access: userData.CashRegister003Access,
      CashRegister004Access: userData.CashRegister004Access,
      PermitirMasdeUnaSesion: userData.PermitirMasdeUnaSesion,
      CierreSesionJornada: userData.CierreSesionJornada,
      BloqueoSesionMaxima: userData.BloqueoSesionMaxima,
      // Also ensure top-level fields are captured if not in Data
      Permissions: userData.Permissions,
      estadousuario: userData.estadousuario,
      TokenSession: userData.TokenSession,
      NewBitacoraRegAcceso: userData.NewBitacoraRegAcceso,
      IsPostulante: userData.IsPostulante,
      Activo: userData.Activo,
      SMS: userData.SMS,
      WhatsApp: userData.WhatsApp,
      // Add avisos data if present
      avisos: userData.avisos || null,
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

const getTimeForToday = (timeString) => {
  if (!timeString || !timeString.includes(':')) return new Date(0);
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  // If the calculated time is in the past, assume it's for tomorrow
  if (date.getTime() < new Date().getTime()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const formatTimeToHHMM = (date) => {
  if (!date) return null;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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
        showTimeoutModal: false,
        isSessionExpiredModalOpen: false,
        isFirstWarningModalOpen: false,
        isSecondWarningModalOpen: false,
        formattedExpirationTime: null,
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
    showTimeoutModal: false,
    isSessionExpiredModalOpen: false,
    isFirstWarningModalOpen: false,
    isSecondWarningModalOpen: false,
    formattedExpirationTime: null,
  };
};

// Estado inicial
const initialState = getInitialAuthState();

export const AuthProvider = ({ children }) => {
  // Estados principales
  const [state, setState] = useState(initialState);
  const { config, reloadConfig, clearConfig } = useConfig();
  
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

  // Verificar usuario actual
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/auth/current-user', { withCredentials: true });
      alert(response)
      if (response.success) {
        const fullResponseData = response.data;
        const nestedData = response.data.Data;
        const jwtToken = fullResponseData.TokenSession;
        const jwtClaims = userDataUtils.decodeJwtToken(jwtToken || '');
        const horaTerminoJornadaLaboral = response.HoraTerminoJornadaLaboral;
        const primerAviso = response.data.primerAviso;
        const segundoAviso = response.data.segundoAviso;

        const combinedData = {
          ...fullResponseData,
          ...(nestedData && nestedData),
          ...jwtClaims,
          avisos: { // Add avisos to combinedData
            primeraviso: primerAviso,
            segundoaviso: segundoAviso,
            expiracion: horaTerminoJornadaLaboral,
          },
        };
        const normalizedUser = userDataUtils.normalizeUserData(combinedData);
        updateState({ user: normalizedUser, loading: false, isInitialized: true, error: null });
        const negocioData = userDataUtils.extractNegocioData(normalizedUser);
        if (negocioData) setNegocio(negocioData);
      } else {
         console.log(response)
        // If API call is successful but backend indicates not authenticated
        if (!PUBLIC_ROUTES.includes(location.pathname)) cleanupAndRedirect();
             
        else updateState({ loading: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Error al verificar usuario actual:', error);
      // If API call fails (e.g., 401 due to invalid/missing cookie)
      if (!PUBLIC_ROUTES.includes(location.pathname)) {
        cleanupAndRedirect();
      }
      else {
        // On public routes, if current user check fails, ensure user state is cleared
        updateState({ user: null, loading: false, isInitialized: true, error: null });
      }
    } finally {
      // Ensure isInitialized is always set to true after the check
      if (!state.isInitialized) updateState({ isInitialized: true });
    }
  }, [location.pathname, cleanupAndRedirect, updateState, state.isInitialized, setNegocio]);

  // Función de login
  const login = useCallback(async (credentials) => {
    updateState({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials, { withCredentials: true });
      
      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Error en la autenticación');
      }

      const fullResponseData = response.data; // Get the whole response.data
      const nestedData = response.data.Data; // Get the nested Data object

      const jwtToken = fullResponseData.TokenSession;
      const jwtClaims = userDataUtils.decodeJwtToken(jwtToken);
      const horaTerminoJornadaLaboral = response.data.horaTerminoJornadaLaboral;
      const primerAviso = response.data.primerAviso;
      const segundoAviso = response.data.segundoAviso;

      // Combine all relevant data sources, prioritizing nestedData and then jwtClaims
      const combinedData = {
        ...fullResponseData, // Start with top-level response data
        ...(nestedData && nestedData), // Overlay with nested Data if it exists
        ...jwtClaims, // Overlay with JWT claims
        avisos: { // Add avisos to combinedData
          primeraviso: primerAviso,
          segundoaviso: segundoAviso,
          expiracion: horaTerminoJornadaLaboral,
        },
      };
      
      const normalizedUser = userDataUtils.normalizeUserData(combinedData);

      updateState({ user: normalizedUser, loading: false, error: null });
      
      // If using HTTP-only cookies, storing token in localStorage is not strictly necessary for session management
      if (jwtToken) storageUtils.setItem(STORAGE_KEYS.TOKEN, jwtToken);
      storageUtils.setItem(STORAGE_KEYS.USER_DATA, normalizedUser);
      
      const negocioData = userDataUtils.extractNegocioData(normalizedUser);
      if (negocioData) setNegocio(negocioData);

      await reloadConfig();
      
      // After successful login, the user state is set. Let ProtectedRoute handle the initial check on next route.
      // Removed: await fetchCurrentUser();

      return normalizedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.Message || 'Error en la autenticación';
      updateState({ error: errorMessage, loading: false });
      throw error;
    } 
  }, [updateState, reloadConfig, setNegocio]);

  // Handlers para modales de aviso y timeout
  const handleShowTimeoutModal = useCallback(() => updateState({ showTimeoutModal: true }), [updateState]);
  const handleContinueTimeout = useCallback(() => updateState({ showTimeoutModal: false }), [updateState]);
  const handleLogoutTimeout = useCallback(() => {
    updateState({ showTimeoutModal: false });
    directLogout();
  }, [directLogout, updateState]);

  const handleCloseFirstWarning = useCallback(() => updateState({ isFirstWarningModalOpen: false }), [updateState]);
  const handleCloseSecondWarning = useCallback(() => updateState({ isSecondWarningModalOpen: false }), [updateState]);
  const handleSessionExpired = useCallback(() => {
    directLogout();
  }, [directLogout]);

  // EFECTO PARA EL RELOJ DE EXPIRACIÓN DE SESIÓN
  useEffect(() => {
    let sessionClockInterval;
    if (state.user && state.user.avisos) {
      let warningsShown = { first: false, second: false };
      const checkSessionTimes = () => {
        try {
          const avisos = state.user.avisos;
          const now = new Date();

          const firstWarningTime = getTimeForToday(avisos.primeraviso);
          const secondWarningTime = getTimeForToday(avisos.segundoaviso);
          const expirationTime = getTimeForToday(avisos.expiracion);

          if (now >= expirationTime) {
            updateState({ isSessionExpiredModalOpen: true });
            if (sessionClockInterval) clearInterval(sessionClockInterval);
            return;
          }
          if (now >= secondWarningTime && !warningsShown.second) {
            warningsShown.second = true;
            updateState({ isSecondWarningModalOpen: true });
          }
          if (now >= firstWarningTime && !warningsShown.first) {
            warningsShown.first = true;
            updateState({ isFirstWarningModalOpen: true });
          }
        } catch (error) {
          console.error("Error al verificar los tiempos de sesión:", error);
        }
      };

      checkSessionTimes();
      sessionClockInterval = setInterval(checkSessionTimes, 30000);
    }

    return () => {
      if (sessionClockInterval) clearInterval(sessionClockInterval);
    };
  }, [state.user, updateState]);

  // Efecto para verificación inicial de sesión
  useEffect(() => {
    // Only fetch current user if not on a public route AND if not already initialized from storage
    if (!PUBLIC_ROUTES.includes(location.pathname) && !state.isInitialized) {
      fetchCurrentUser();
    } else if (PUBLIC_ROUTES.includes(location.pathname) && !state.isInitialized) {
      // If on a public route and not initialized, just set initialized to true and loading to false
      updateState({ loading: false, isInitialized: true });
    }
  }, [location.pathname, fetchCurrentUser, updateState, state.isInitialized]); // Added state.isInitialized to dependencies

  // Valor del contexto
  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    directLogout,
    confirmLogout,
    cleanupAndRedirect,
    fetchCurrentUser,
    setNegocio,
    showTimeoutModal: handleShowTimeoutModal,
    handleContinueTimeout,
    handleLogoutTimeout,
    handleCloseFirstWarning,
    handleCloseSecondWarning,
    handleSessionExpired
  }), [state, login, logout, directLogout, confirmLogout, cleanupAndRedirect, fetchCurrentUser, setNegocio, handleShowTimeoutModal, handleContinueTimeout, handleLogoutTimeout, handleCloseFirstWarning, handleCloseSecondWarning, handleSessionExpired]);

  if (!state.isInitialized) {
    return null; // O un spinner de carga global
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <TimeoutModal
        open={state.showTimeoutModal}
        onContinue={handleContinueTimeout}
        onLogout={handleLogoutTimeout}
      />
      <FirstWarningModal 
        isOpen={state.isFirstWarningModalOpen} 
        onClose={handleCloseFirstWarning} 
      />
      <SecondWarningModal 
        isOpen={state.isSecondWarningModalOpen} 
        onClose={handleCloseSecondWarning} 
      />
      <SessionExpiredModal 
        isOpen={state.isSessionExpiredModalOpen} 
        onClose={handleSessionExpired} 
      />
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;