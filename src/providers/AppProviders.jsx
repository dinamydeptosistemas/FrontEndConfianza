import React from 'react';
import useInactivityLogout from '../hooks/useInactivityLogout';
import WorkJustificationModal from '../components/modals/WorkJustificationModal';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

export const AppProviders = ({ children }) => {
    // Estado global para el modal RRHH
    const [showModal, setShowModal] = React.useState(false);
    const [lastActivity, setLastActivity] = React.useState(null);
    const [minutesInactive, setMinutesInactive] = React.useState(0);
    const [secondsRemaining, setSecondsRemaining] = React.useState(10 * 60);


    React.useEffect(() => {
        let intervalId;
        if (showModal) {
            intervalId = setInterval(() => {
                setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else {
            setSecondsRemaining(10 * 60);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [showModal]);

    useInactivityLogout({
        inactivityThreshold: 10 * 60 * 1000, // 10 minutos
        onInactivity: ({ lastActivity, minutesInactive }) => {
            setShowModal(true);
            setLastActivity(lastActivity);
            setMinutesInactive(minutesInactive);
        },
        enabled: true
    });

    const handleContinue = () => {
        setShowModal(false);
    };
    const handleRRHHJustification = motivo => {
        setShowModal(false);
    };
    const handleLogout = () => {
        setShowModal(false);
        window.location.href = '/login';
    };

    return (
        <BrowserRouter>
            <AuthProvider>
                <WorkJustificationModal
                    open={showModal}
                    onContinue={handleContinue}
                    onRRHHJustification={handleRRHHJustification}
                    onLogout={handleLogout}
                    minutesSinceLastActivity={minutesInactive}
                    lastActivity={lastActivity}
                    secondsRemaining={secondsRemaining}
                />
                {children}
            </AuthProvider>
        </BrowserRouter>
    );
}; 