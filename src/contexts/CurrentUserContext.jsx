import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FirstWarningModal } from '../components/common/FirstWarningModal';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SecondWarningModal } from '../components/common/SecondWarningModal';
import { SessionExpiredModal } from '../components/common/SessionExpiredModal';
import axiosInstance from '../config/axios';
import { useConfig } from '../contexts/ConfigContext';

const getTimeForToday = (timeString) => {
  if (!timeString || !timeString.includes(':')) return new Date(0);
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

const cleanTimeString = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;
  return timeString.substring(0, 5);
};

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
  const { config, loading: configLoading } = useConfig();

  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    updateState({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/auth/current-user');
      if (response.data && response.data.success) {
        const userData = response.data;
        const normalizedUser = {
          Username: userData.username,
          UserType: userData.userFunction,
          NameEntity: userData.nameEntity,
          CodeEntity: userData.codeEntity,
          avisos: {
            primeraviso: cleanTimeString(userData.primerAviso),
            segundoaviso: cleanTimeString(userData.segundoAviso),
            expiracion: cleanTimeString(userData.horaTerminoJornadaLaboral),
          },
        };
        updateState({ user: normalizedUser, loading: false, isInitialized: true, error: null });
        return normalizedUser;
      } else {
        throw new Error(response.data.Message || 'Fallo al cargar usuario.');
      }
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      updateState({ user: null, loading: false, isInitialized: true, error: error.message || 'Error desconocido al obtener usuario' });
      return null;
    }
  }, [updateState]);

  const handleCloseFirstWarning = useCallback(() => updateState({ isFirstWarningModalOpen: false }), [updateState]);
  const handleCloseSecondWarning = useCallback(() => updateState({ isSecondWarningModalOpen: false }), [updateState]);
  const handleSessionExpired = useCallback(() => {
    console.log('Sesión Expirada. Ejecutando logout completo...');
    updateState({ isSessionExpiredModalOpen: false });
    directLogout();
  }, [directLogout, updateState]);

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

  useEffect(() => {
    console.log('[Debug] Evaluando useEffect del reloj de sesión...');

    if (!config || configLoading) {
      console.log('[Debug] Configuración no cargada o en proceso. Abortando reloj.');
      return;
    }

    if (config.cerradosesioninactiva === false) {
      console.log('[Debug] Cierre de sesión por inactividad está deshabilitado en la configuración.');
      return;
    }

    console.log('[Debug] Cierre de sesión por inactividad está HABILITADO.');

    const publicPages = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo'];
    if (publicPages.includes(location.pathname) || !state.user) {
      console.log('[Debug] En página pública o sin usuario. Abortando reloj.');
      updateState({ isFirstWarningModalOpen: false, isSecondWarningModalOpen: false, isSessionExpiredModalOpen: false });
      return;
    }

    console.log('[Debug] Usuario autenticado y en página privada.');

    let sessionClockInterval;

    if (state.user && state.user.avisos) {
      console.log('[Debug] Usuario tiene objeto de avisos. Configurando intervalo...');
      
      let warningsShown = { first: state.isFirstWarningModalOpen, second: state.isSecondWarningModalOpen };
      const { primeraviso, segundoaviso, expiracion } = state.user.avisos;

      const checkSessionTimes = () => {
        try {
          const now = new Date();
          const firstWarningTime = getTimeForToday(primeraviso);
          const secondWarningTime = getTimeForToday(segundoaviso);
          const expirationTime = getTimeForToday(expiracion);

          // LOGS PARA SEGUIMIENTO
          const timeFormat = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
          console.log(`[Reloj] Hora Actual: ${now.toLocaleTimeString('es-CL', timeFormat)}`);
          console.log(`[Reloj] Hora de Expiración: ${expirationTime.toLocaleTimeString('es-CL', timeFormat)}`);

          if (now >= expirationTime) {
            console.warn('[Reloj] Sesión Expirada!');
            updateState({ isSessionExpiredModalOpen: true });
            clearInterval(sessionClockInterval);
            return;
          }

          if (now >= secondWarningTime && !warningsShown.second) {
            console.log('[Reloj] Activando Segundo Aviso.');
            warningsShown.second = true;
            updateState({ isSecondWarningModalOpen: true });
          }
          
          if (now >= firstWarningTime && !warningsShown.first && !warningsShown.second) {
            console.log('[Reloj] Activando Primer Aviso.');
            warningsShown.first = true;
            updateState({ isFirstWarningModalOpen: true });
          }
        } catch (error) {
          console.error("Error al verificar los tiempos de sesión:", error);
        }
      };

      checkSessionTimes();
      sessionClockInterval = setInterval(checkSessionTimes, 10000);
      console.log('[Debug] Intervalo configurado para ejecutarse cada 10 segundos.');

    } else {
      console.log('[Debug] Usuario NO tiene objeto de avisos. El reloj no se configurará.');
    }

    return () => {
      if (sessionClockInterval) {
        console.log('[Debug] Limpiando intervalo del reloj de sesión.');
        clearInterval(sessionClockInterval);
      }
    };
  }, [state.user, updateState, location.pathname, config, configLoading]);

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
      <FirstWarningModal isOpen={state.isFirstWarningModalOpen} onClose={handleCloseFirstWarning} />
      <SecondWarningModal isOpen={state.isSecondWarningModalOpen} onClose={handleCloseSecondWarning} />
      <SessionExpiredModal isOpen={state.isSessionExpiredModalOpen} onClose={handleSessionExpired} />
    </CurrentUserContext.Provider>
  );
};

CurrentUserProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CurrentUserContext;