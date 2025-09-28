import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FirstWarningModal } from '../components/common/FirstWarningModal';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SecondWarningModal } from '../components/common/SecondWarningModal';
import { SessionExpiredModal } from '../components/common/SessionExpiredModal';
// import axiosInstance from '../config/axios';


const getTimeForToday = (timeString) => {
  if (!timeString || !timeString.includes(':')) return new Date(0);
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

// Utilidad para limpiar el formato "HH:MM:SS" a "HH:MM"
const cleanTimeString = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;
  // Toma los primeros 5 caracteres ("HH:MM")
  return timeString.substring(0, 5); 
};





const MOCK_SERVER_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "userId": 1,
  "username": "XAVIER",
  "userFunction": "MANAGER SYSTEM",
  "codeFunction": 1,
  "codeEntity": "999",
  "nameEntity": "EMPRESA DE PRUEBA",
  "permissions": "True",
  "estadousuario": 1,
  "tokenSession": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6MSwidXNlcklkIjoxLCJ1c2VybmFtZSI6IlhBVklFUiIsInVzZXJUeXBlIjoxLCJOZXdCaXRhY29yYVJlZ0FjY2VzbyI6MywiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiaW50ZXJuYWwiLCJ1c2VyRnVuY3Rpb24iOiJNQU5BR0VSIFNZU1RFTSIsImNvZGVGdW5jdGlvbiI6MSwiaXNQb3N0dWxhbnRlIjpmYWxzZSwiY29kZUVudGl0eSI6Ijk5OSIsIm5hbWVFbnRpdHkiOiJFTVBSRVNBIERFIFBSVUVCQSIsInBlcm1pc3Npb25zIjoiVHJ1ZSIsImVzdGFkb3VzdWFyaW8iOjEsIkNpZXJyZVNlc2lvbkpvcm5hZGEiOjEsIkJsb3F1ZW9TZXNpb25NYXhpbWEiOjEyLCJsYXN0QWN0aXZpdHkiOiIyMDI1LTA5LTI3VDAzOjIxOjAwLjc3NzU5MTlaIiwiZXhwIjoxNzkwNDc5MjYwLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUyMDEiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAifQ.uy4cK4rjUw0th3QYOCouAIbPBRAYGNPX6nmpr69-Bpg",
  "tipoUsuario": "INTERNO",
  "newBitacoraRegAcceso": 3,
  "isPostulante": false,
  "data": null,
  "horaDeIngreso": "23:35:00.6433333",
  "cierreSesionJornada": 1,
  "bloqueoSesionMaxima": 12,
  "horaTerminoJornadaLaboral": "11:40:00",
  "primerAviso": "11:35:00",
  "segundoAviso": "11:37:00"
};
// --- Fin de Configuración de Tiempos ---


// =================================================================================
// 3. CONTEXTO DE USUARIO (CurrentUserContext)
// =================================================================================

const CurrentUserContext = createContext();

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser debe ser usado dentro de un CurrentUserProvider');
  }
  return context;
};

const initialState = {
  user: null,
  loading: true,
  error: null,
  isInitialized: false,
  isFirstWarningModalOpen: false,
  isSecondWarningModalOpen: false,
  isSessionExpiredModalOpen: false,
};

export const CurrentUserProvider = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState(initialState);
  const { directLogout } = useAuth();

  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Función para simular la obtención del usuario actual
  const fetchCurrentUser = useCallback(async () => {
    updateState({ loading: true, error: null });
    try {
      // Simular un delay de red
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const response = MOCK_SERVER_RESPONSE;

      // Usamos 'response.success' para el chequeo de éxito, ya que el JSON lo tiene en minúsculas.
      if (response.success) {
        // Mapeo de campos del JSON a la estructura esperada por la aplicación
        const normalizedUser = {
          Username: response.username,
          UserType: response.userFunction, // userFunction mapeado a UserType
          NameEntity: response.nameEntity,
          CodeEntity: response.codeEntity,
          avisos: {
            // Normalización de HH:MM:SS a HH:MM
            primeraviso: cleanTimeString(response.primerAviso),
            segundoaviso: cleanTimeString(response.segundoAviso),
            expiracion: cleanTimeString(response.horaTerminoJornadaLaboral),
          },
        };
        
        updateState({ 
            user: normalizedUser, 
            loading: false, 
            isInitialized: true, 
            error: null 
        });
        return normalizedUser;
      } else {
        throw new Error(response.Message || 'Fallo al cargar usuario ficticio.');
      }
    } catch (error) {
      console.error('Error al simular la obtención del usuario actual:', error);
      updateState({ 
        user: null, 
        loading: false, 
        isInitialized: true, 
        error: error.message || 'Error desconocido al obtener usuario' 
      });
      return null;
    }
  }, [updateState]);

  // Handlers para modales de aviso
  const handleCloseFirstWarning = useCallback(() => updateState({ isFirstWarningModalOpen: false }), [updateState]);
  const handleCloseSecondWarning = useCallback(() => updateState({ isSecondWarningModalOpen: false }), [updateState]);
  const handleSessionExpired = useCallback(() => {
    console.log('Sesión Expirada. Ejecutando logout completo...');
    directLogout();
  }, [directLogout]);

  // EFECTO 1: Verificación inicial de usuario
  useEffect(() => {
    const publicPages = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo'];
    if (publicPages.includes(location.pathname)) {
      updateState({ loading: false, isInitialized: true, user: null });
      return;
    }

    if (!state.isInitialized) {
        fetchCurrentUser();
    }
  }, [state.isInitialized, fetchCurrentUser, location.pathname, updateState]);

  // EFECTO 2: LÓGICA DEL RELOJ DE SESIÓN
  useEffect(() => {
    const publicPages = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo'];
    if (publicPages.includes(location.pathname) || !state.user) {
      // Si estamos en una página pública o no hay usuario, nos aseguramos que los modales estén cerrados y no hacemos nada más.
      updateState({
        isFirstWarningModalOpen: false,
        isSecondWarningModalOpen: false,
        isSessionExpiredModalOpen: false,
      });
      return;
    }

    let sessionClockInterval;

    if (state.user && state.user.avisos) {
      // Usamos una referencia mutable local para controlar si ya se mostraron los avisos
      let warningsShown = { first: state.isFirstWarningModalOpen, second: state.isSecondWarningModalOpen };
      const { primeraviso, segundoaviso, expiracion } = state.user.avisos;

      const checkSessionTimes = () => {
        try {
          const now = new Date();

          // Las horas se obtienen del estado del usuario
          const firstWarningTime = getTimeForToday(primeraviso);
          const secondWarningTime = getTimeForToday(segundoaviso);
          const expirationTime = getTimeForToday(expiracion);

          // LOGS PARA SEGUIMIENTO
          const timeFormat = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
          console.log(`[Reloj] Hora Actual: ${now.toLocaleTimeString('es-CL', timeFormat)}`);
          console.log(`[Reloj] Hora de Expiración: ${expirationTime.toLocaleTimeString('es-CL', timeFormat)}`);
          console.log(`[Debug] ¿Tiempo de expirar? ${now >= expirationTime}`);
          console.log(`[Debug] ¿Tiempo del 2do aviso? ${now >= secondWarningTime}`);
          console.log(`[Debug] ¿Tiempo del 1er aviso? ${now >= firstWarningTime}`);


          // 1. Lógica de Expiración (Máxima Prioridad)
          if (now >= expirationTime) {
            console.warn('[Reloj] Sesión Expirada!');
            updateState({ isSessionExpiredModalOpen: true });
            clearInterval(sessionClockInterval);
            return;
          }

          // 2. Lógica de Segundo Aviso
          if (now >= secondWarningTime && !warningsShown.second) {
            console.log('[Reloj] Activando Segundo Aviso.');
            warningsShown.second = true;
            updateState({ isSecondWarningModalOpen: true });
          }
          
          // 3. Lógica de Primer Aviso
          // Solo mostrar el primer aviso si el segundo no está ya activo
          if (now >= firstWarningTime && !warningsShown.first && !warningsShown.second) {
            console.log('[Reloj] Activando Primer Aviso.');
            warningsShown.first = true;
            updateState({ isFirstWarningModalOpen: true });
          }

        } catch (error) {
          console.error("Error al verificar los tiempos de sesión:", error);
        }
      };

      // Ejecutar inmediatamente y luego cada 10 segundos
      checkSessionTimes();
      sessionClockInterval = setInterval(checkSessionTimes, 10000); // Check cada 10 segundos
    }

    // Función de limpieza
    return () => {
      if (sessionClockInterval) clearInterval(sessionClockInterval);
    };
  }, [state.user, updateState, location.pathname]);

  const contextValue = useMemo(() => ({
    ...state,
    fetchCurrentUser, 
    handleCloseFirstWarning,
    handleCloseSecondWarning,
    handleSessionExpired,
  }), [state, fetchCurrentUser, handleCloseFirstWarning, handleCloseSecondWarning, handleSessionExpired]);


  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
      {/* Renderizado de Modales */}
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
    </CurrentUserContext.Provider>
  );
};

CurrentUserProvider.propTypes = {
  children: PropTypes.node.isRequired
};




export default CurrentUserContext;