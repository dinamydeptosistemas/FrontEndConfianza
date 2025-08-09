import React from 'react';
import useWorkStatusMonitor from '../hooks/useWorkStatusMonitor';
import WorkJustificationModal from './modals/WorkJustificationModal';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente que monitorea la actividad de trabajo del usuario
 * Se integra en la aplicación para mostrar el modal de justificación cuando sea necesario
 */
const WorkActivityMonitor = () => {
    const { directLogout } = useAuth();
    
    const {
        showJustificationModal,
        lastActivity,
        minutesSinceLastActivity,
        
        error,
        handleContinueWork,
        handleRRHHJustification,
        handleLogout
    } = useWorkStatusMonitor();

    // Manejar el cierre de sesión
    const handleLogoutAction = () => {
        handleLogout();
        directLogout();
    };

    // Log de errores para debugging (solo en desarrollo)
    if (error && process.env.NODE_ENV === 'development') {
        console.warn('Error en monitoreo de actividad de trabajo:', error);
    }

    return (
        <>
            <WorkJustificationModal
                open={showJustificationModal}
                onContinue={handleContinueWork}
                onRRHHJustification={handleRRHHJustification}
                onLogout={handleLogoutAction}
                minutesSinceLastActivity={minutesSinceLastActivity}
                lastActivity={lastActivity}
            />
            
            {/* Indicador de estado para debugging (solo en desarrollo) */}
        </>
    );
};

export default WorkActivityMonitor;
