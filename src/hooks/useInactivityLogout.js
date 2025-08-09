



import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para detectar inactividad y mostrar un modal de RRHH.
 * Si no hay actividad de red (fetch o axios) durante 10 minutos,
 * se ejecuta un callback.
 */
const useInactivityLogout = (options = {}) => {
    const {
        inactivityThreshold = 10 * 60 * 1000, // 10 minutos
        onInactivity,
        enabled = true,
        debug = false
    } = options;

    const lastActivityRef = useRef(Date.now());
    const inactivityTimerRef = useRef(null);
    const secondsRemainingRef = useRef(10 * 60);
    const { user } = useAuth();

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        secondsRemainingRef.current = inactivityThreshold / 1000;
        if (debug) {
            console.log('[InactivityLogout] Timer reset due to activity.');
        }
    }, [debug, inactivityThreshold]);

    const checkInactivity = useCallback(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        secondsRemainingRef.current = Math.max(Math.round((inactivityThreshold - timeSinceLastActivity) / 1000), 0);

        if (debug) {
            console.log(`[InactivityLogout] Checking inactivity. Time remaining: ${secondsRemainingRef.current}s`);
        }
        // Mostrar siempre el contador en consola
        console.log(`[InactivityLogout] Segundos restantes: ${secondsRemainingRef.current}`);

        if (timeSinceLastActivity >= inactivityThreshold) {
            if (onInactivity) {
                const data = {
                    lastActivity: new Date(lastActivityRef.current),
                    minutesInactive: Math.floor(timeSinceLastActivity / 60000),
                    secondsRemaining: secondsRemainingRef.current
                };
                onInactivity(data);
            }
            clearInterval(inactivityTimerRef.current);
        }
    }, [inactivityThreshold, onInactivity, debug]);

    useEffect(() => {
        if (!enabled || !user) {
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
            }
            return;
        }

        // Reiniciar el timer en la carga inicial y en cada cambio de usuario
        resetTimer();

        // Interceptar fetch
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            resetTimer();
            return originalFetch(...args);
        };

        // Interceptar axios (si se usa)
        const setupAxiosInterceptor = (axiosInstance) => {
            if (axiosInstance && axiosInstance.interceptors) {
                const requestInterceptor = axiosInstance.interceptors.request.use(
                    config => {
                        resetTimer();
                        return config;
                    },
                    error => {
                        return Promise.reject(error);
                    }
                );
                return () => {
                    axiosInstance.interceptors.request.eject(requestInterceptor);
                };
            }
            return () => {};
        };

        // Asumiendo que la instancia de axios está disponible globalmente o es importable
        // Si no, esto necesitará ser ajustado.
        let cleanupAxios = () => {};
        if (window.axios) {
            cleanupAxios = setupAxiosInterceptor(window.axios);
        }


        // Iniciar el timer para chequear inactividad
        inactivityTimerRef.current = setInterval(checkInactivity, 1000); // Chequea cada segundo

        return () => {
            window.fetch = originalFetch;
            cleanupAxios();
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
            }
        };
    }, [enabled, user, resetTimer, checkInactivity]);

    return { resetTimer };
};

export default useInactivityLogout;
