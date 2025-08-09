import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import useInactivityTimer from '../hooks/useInactivityTimer';
import WorkJustificationModal from './modals/WorkJustificationModal';

/**
 * Componente que monitorea la inactividad del usuario usando un cronómetro local
 * Muestra el modal de justificación después de 10 minutos de inactividad
 * EXCLUYE rutas de autenticación que NO cuentan como trabajo
 */
const InactivityMonitor = () => {
    const { user, directLogout } = useAuth();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [inactivityData, setInactivityData] = useState(null);

    /**
     * Callback cuando se detecta inactividad (10 minutos)
     */
    const handleInactivityDetected = useCallback((data) => {
        console.log('Inactividad detectada después de 10 minutos:', data);
        setInactivityData(data);
        setShowModal(true);
    }, []);

    // Rutas donde NO se debe monitorear (actividades de autenticación NO cuentan como trabajo)
    const excludedRoutes = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo', '/validate-email', '/logout'];
    const isInAuthRoute = excludedRoutes.includes(location.pathname);

    // Configurar el cronómetro de inactividad
    const {
        isInactive,
        resetTimer,
        minutesRemaining,
        secondsRemaining,
        percentageRemaining,
        getStatus
    } = useInactivityTimer({
        inactivityThreshold: 10 * 60 * 1000, // 10 minutos
        checkInterval: 1000, // Verificar cada segundo
        onInactivityDetected: handleInactivityDetected,
        enabled: !!user && !isInAuthRoute, // Solo activo si hay usuario Y NO está en ruta de auth
        excludedRoutes, // Pasar rutas excluidas al hook
        debug: process.env.NODE_ENV === 'development',
        preventAutoLogout: true // Evitar cierre de sesión automático
    });

    /**
     * Maneja cuando el usuario elige continuar trabajando
     */
    const handleContinue = useCallback(() => {
        setShowModal(false);
        resetTimer();
        console.log('Usuario continúa trabajando - temporizador reiniciado');
    }, [resetTimer]);

    /**
     * Maneja cuando el usuario elige justificar la inactividad
     */
    const handleJustify = useCallback((justification) => {
        console.log('Inactividad justificada:', justification);
        
        // Crear objeto con la justificación y datos del usuario
        const justificationData = {
            motivo: justification,
            timestamp: new Date().toISOString(),
            user: {
                id: user?.UserID || user?.UserId,
                username: user?.Username,
                function: user?.UserFunction
            },
            inactivityData
        };
        
        // Guardar justificación en localStorage
        localStorage.setItem('justificacion_inactividad_rrhh', JSON.stringify(justificationData));
        
        // Cerrar modal y reiniciar temporizador
        setShowModal(false);
        setInactivityData(null);
        resetTimer();
        
        console.log('Justificación guardada:', justificationData);
    }, [user, inactivityData, resetTimer]);

    /**
     * Maneja cuando el usuario elige cerrar sesión
     */
    const handleLogout = useCallback(() => {
        console.log('Usuario eligió cerrar sesión desde modal de inactividad');
        setShowModal(false);
        setInactivityData(null);
        // Llamar a directLogout solo si el usuario decide cerrar sesión explícitamente
        directLogout();
    }, [directLogout]);

    // No renderizar si no hay usuario
    if (!user) {
        return null;
    }

    return (
        <>
            {/* Indicador de desarrollo para ver el cronómetro */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-40 text-xs">
                    <div className="font-semibold mb-1">Cronómetro de Inactividad</div>
                    <div>Ruta actual: {location.pathname}</div>
                    <div className={isInAuthRoute ? 'text-yellow-400' : 'text-green-400'}>
                        {isInAuthRoute ? 'EXCLUIDA (No cuenta como trabajo)' : 'Monitoreando actividad'}
                    </div>
                    {window.SystemActivityInProgress && (
                        <div className="text-orange-400">
                            ⚠️ Sistema verificando - actividad ignorada
                        </div>
                    )}
                    <div>Tiempo restante: {minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')}</div>
                    <div>Estado: {isInactive ? 'Inactivo' : 'Activo'}</div>
                    <div>Progreso: {Math.round(percentageRemaining)}%</div>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                        <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${percentageRemaining}%` }}
                        ></div>
                    </div>
                    <button 
                        onClick={() => {
                            const status = getStatus();
                            console.log('Estado del cronómetro:', status);
                        }}
                        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
                    >
                        Log Status
                    </button>
                </div>
            )}

            {/* Modal de justificación */}
            <WorkJustificationModal
                open={showModal}
                onContinue={handleContinue}
                onRRHHJustification={handleJustify}
                onLogout={handleLogout}
                minutesSinceLastActivity={inactivityData?.minutesInactive || 10}
                lastActivity={inactivityData?.lastActivity}
            />
        </>
    );
};

export default InactivityMonitor;
