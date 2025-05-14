import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../config/axios';

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutos en milisegundos

export const useSessionTimeout = ({ disabled } = {}) => {
    const auth = useAuth();
    const timeoutRef = useRef(null);

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            auth.showTimeoutModal();
        }, TIMEOUT_DURATION);
    }, [auth]);

    useEffect(() => {
        if (disabled) return;
        // Eventos que indican actividad del usuario
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Función para resetear el timeout
        const handleUserActivity = () => {
            resetTimeout();
        };

        // Agregar listeners para cada evento
        events.forEach(event => {
            window.addEventListener(event, handleUserActivity);
        });

        // Interceptor para manejar errores de JWT
        const interceptor = axiosInstance.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Si el error es por JWT expirado, cerrar sesión directamente
                    auth.directLogout();
                }
                return Promise.reject(error);
            }
        );

        // Iniciar el timeout
        resetTimeout();

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
            // Remover el interceptor
            axiosInstance.interceptors.response.eject(interceptor);
        };
    }, [auth, resetTimeout, disabled]);
}; 