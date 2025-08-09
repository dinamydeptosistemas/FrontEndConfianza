import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para cronómetro de inactividad que abre modal después de 10 minutos
 * Detecta actividad del usuario y reinicia el contador automáticamente
 * EXCLUYE actividades de autenticación que NO cuentan como trabajo
 */
const useInactivityTimer = (options = {}) => {
    const {
        inactivityThreshold = 10 * 60 * 1000, // 10 minutos en milisegundos
        checkInterval = 1000, // Verificar cada segundo
        onInactivityDetected = null,
        enabled = true,
        debug = false,
        preventAutoLogout = true, // Por defecto, prevenir cierre de sesión automático
        excludedRoutes = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo', '/validate-email', '/logout']
    } = options;
    
    const [timeRemaining, setTimeRemaining] = useState(inactivityThreshold);
    const [isInactive, setIsInactive] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    
    const intervalRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const hasTriggeredRef = useRef(false);

    const { workStatus } = useAuth() || {};
    const lastWorkStatusRef = useRef(null);

    // Maneja la actividad detectada (llamadas a API o cambios en workStatus)
    const handleActivity = useCallback((isApiCall = false) => {
        // No hacer nada si está deshabilitado o es una verificación del sistema
        if (!enabled || window.SystemActivityInProgress) {
            if (debug && isApiCall) {
                console.log('[InactivityTimer] API activity ignored - system verification in progress');
            }
            return;
        }

        // Verificar si estamos en una ruta excluida
        const currentPath = window.location.pathname;
        const isExcluded = excludedRoutes.some(route => currentPath.startsWith(route));
        
        if (isExcluded) {
            if (debug && isApiCall) {
                console.log(`[InactivityTimer] API activity in excluded route: ${currentPath}`);
            }
            return;
        }

        // Actualizar la última actividad
        lastActivityRef.current = Date.now();
        setIsInactive(false);
        setTimeRemaining(inactivityThreshold);
        hasTriggeredRef.current = false;
        
        if (debug && isApiCall) {
            console.log('[InactivityTimer] API activity detected - timer reset');
        }
    }, [enabled, excludedRoutes, inactivityThreshold, debug]);

    // Efecto principal que maneja los cambios en el estado de trabajo
    useEffect(() => {
        if (!enabled || !workStatus) return;
        
        // Verificar si el estado de trabajo ha cambiado
        if (workStatus.isWorking !== lastWorkStatusRef.current) {
            lastWorkStatusRef.current = workStatus.isWorking;
            
            if (workStatus.isWorking) {
                // Usuario está trabajando - reiniciar el temporizador
                handleActivity();
            } else {
                // Usuario no está trabajando - verificar inactividad
                const minutesInactive = workStatus.minutesSinceLastActivity || 0;
                const isInactive = minutesInactive >= (inactivityThreshold / 60000);
                
                if (isInactive && onInactivityDetected && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    setIsInactive(true);
                    setTimeRemaining(0);
                    
                    const data = {
                        lastActivity: new Date(Date.now() - (minutesInactive * 60000)),
                        elapsedTime: minutesInactive * 60000,
                        threshold: inactivityThreshold,
                        minutesInactive: minutesInactive,
                        timestamp: Date.now()
                    };
                    
                    if (debug) {
                        console.log('[InactivityTimer] Inactivity detected - showing modal', data);
                    }
                    
                    onInactivityDetected(data);
                }
            }
        }
    }, [workStatus, enabled, inactivityThreshold, onInactivityDetected, debug, handleActivity]);

    // Efecto para escuchar eventos de actividad de API
    useEffect(() => {
        if (!enabled) return;

        const onApiActivity = () => {
            handleActivity(true);
        };

        // Escuchar eventos de actividad de API
        window.addEventListener('apiActivity', onApiActivity);

        // Limpiar al desmontar
        return () => {
            window.removeEventListener('apiActivity', onApiActivity);
        };
    }, [enabled, handleActivity]);

    /**
     * Reinicia el cronómetro de inactividad
     */
    const resetTimer = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        setLastActivity(now);
        setTimeRemaining(inactivityThreshold);
        setIsInactive(false);
        hasTriggeredRef.current = false;
        
        if (debug) {
            console.log('[InactivityTimer] Timer reset - new activity detected');
        }
    }, [inactivityThreshold, debug]);

    /**
     * Inicia el cronómetro
     */
    const startTimer = useCallback(() => {
        if (!enabled) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivityRef.current;
            const remaining = Math.max(0, inactivityThreshold - timeSinceActivity);
            
            setTimeRemaining(remaining);

            if (debug) {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                console.log(`[InactivityTimer] Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`);
            }

            // Si se acabó el tiempo y no hemos disparado el evento
            if (remaining === 0 && !hasTriggeredRef.current) {
                hasTriggeredRef.current = true;
                setIsInactive(true);
                
                if (debug) {
                    console.log('[InactivityTimer] Inactivity threshold reached - triggering modal');
                }
                
                if (onInactivityDetected) {
                    onInactivityDetected({
                        minutesInactive: Math.floor(timeSinceActivity / 60000),
                        lastActivity: new Date(lastActivityRef.current),
                        timestamp: now
                    });
                }
            }
        }, checkInterval);

        if (debug) {
            console.log('[InactivityTimer] Timer started');
        }
    }, [enabled, inactivityThreshold, checkInterval, onInactivityDetected, debug]);

    /**
     * Detiene el cronómetro
     */
    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        
        if (debug) {
            console.log('[InactivityTimer] Timer stopped');
        }
    }, [debug]);

    /**
     * Fuerza el disparo del modal (para testing)
     */
    const forceInactivity = useCallback(() => {
        if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setIsInactive(true);
            setTimeRemaining(0);
            
            const now = Date.now();
            lastActivityRef.current = now - (inactivityThreshold + 1000);
            
            if (onInactivityDetected) {
                onInactivityDetected({
                    minutesInactive: Math.ceil((inactivityThreshold + 1000) / 60000),
                    lastActivity: new Date(lastActivityRef.current),
                    timestamp: now,
                    elapsedTime: inactivityThreshold + 1000,
                    threshold: inactivityThreshold,
                    forced: true
                });
            }
            
            if (debug) {
                console.log('[InactivityTimer] Inactivity forced manually');
            }
        }
    }, [onInactivityDetected, inactivityThreshold, debug]);

    // Configurar el temporizador cuando se habilita/deshabilita
    useEffect(() => {
        if (enabled) {
            // Resetear la última actividad al iniciar
            lastActivityRef.current = Date.now();
            
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeSinceLastActivity = now - lastActivityRef.current;
                const remaining = Math.max(0, inactivityThreshold - timeSinceLastActivity);
                
                setTimeRemaining(remaining);
                
                if (debug) {
                    const minutes = Math.floor(remaining / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    console.log(`[InactivityTimer] Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`);
                }
                
                // Verificar inactividad solo si no hay actividad reciente
                if (remaining === 0 && onInactivityDetected && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    setIsInactive(true);
                    
                    const data = {
                        lastActivity: new Date(lastActivityRef.current),
                        elapsedTime: timeSinceLastActivity,
                        threshold: inactivityThreshold,
                        minutesInactive: Math.ceil(timeSinceLastActivity / 60000),
                        timestamp: now,
                        preventAutoLogout // Incluir esta información en los datos
                    };
                    
                    if (debug) {
                        console.log(`[InactivityTimer] Inactivity threshold reached (preventAutoLogout: ${preventAutoLogout})`, data);
                    }
                    
                    // Solo ejecutar el callback de inactividad, no cerramos sesión
                    onInactivityDetected(data);
                    
                    // No reiniciamos el temporizador aquí para mantener el estado inactivo
                    // hasta que el usuario interactúe con el modal
                }
            }, checkInterval);
            
            if (debug) {
                console.log(`[InactivityTimer] Timer started (preventAutoLogout: ${preventAutoLogout})`);
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                
                if (debug) {
                    console.log('[InactivityTimer] Timer stopped');
                }
            }
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

        };
    }, [enabled, inactivityThreshold, checkInterval, onInactivityDetected, debug, preventAutoLogout]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

        };
    }, []);

    /**
     * Obtiene información del estado actual
     */
    const getStatus = useCallback(() => {
        const now = Date.now();
        const timeSinceActivity = now - lastActivityRef.current;
        
        return {
            timeRemaining,
            isInactive,
            lastActivity: new Date(lastActivityRef.current),
            minutesSinceActivity: Math.floor(timeSinceActivity / 60000),
            secondsSinceActivity: Math.floor(timeSinceActivity / 1000),
            hasTriggered: hasTriggeredRef.current,
            enabled
        };
    }, [timeRemaining, isInactive, enabled]);

    return {
        timeRemaining,
        isInactive,
        lastActivity,
        resetTimer,
        startTimer,
        stopTimer,
        forceInactivity,
        getStatus,
        // Propiedades calculadas
        minutesRemaining: Math.floor(timeRemaining / 60000),
        secondsRemaining: Math.floor((timeRemaining % 60000) / 1000),
        percentageRemaining: (timeRemaining / inactivityThreshold) * 100
    };
};

export default useInactivityTimer;
