import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import useInactivityLogout from '../hooks/useInactivityLogout';
import WorkJustificationModal from '../components/modals/WorkJustificationModal';
import { AuthProvider } from '../contexts/AuthContext';

const InactivityManager = ({ children }) => {
    const location = useLocation();
    const excludedPaths = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo'];
    const isEnabled = !excludedPaths.includes(location.pathname);

    const [showModal, setShowModal] = React.useState(false);
    const [lastActivity, setLastActivity] = React.useState(null);
    const [minutesInactive, setMinutesInactive] = React.useState(0);
    const [secondsRemaining, setSecondsRemaining] = React.useState(10 * 60);

    React.useEffect(() => {
        if (!isEnabled) {
            setShowModal(false);
        }
    }, [isEnabled]);

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
        enabled: isEnabled,
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
        <>
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
        </>
    );
};

export const AppProviders = ({ children }) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <InactivityManager>
                    {children}
                </InactivityManager>
            </AuthProvider>
        </BrowserRouter>
    );
};