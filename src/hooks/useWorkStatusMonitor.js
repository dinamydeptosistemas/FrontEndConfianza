import { useState, useEffect, useCallback } from 'react';

const useWorkStatusMonitor = () => {
    const [showJustificationModal, setShowJustificationModal] = useState(false);
    const [lastActivity, setLastActivity] = useState(new Date());
    const [minutesSinceLastActivity, setMinutesSinceLastActivity] = useState(0);


    // Placeholder functions for now
    const handleContinueWork = useCallback(() => {
        console.log('Continuing work...');
        setShowJustificationModal(false);
        setLastActivity(new Date()); // Reset activity on continue
    }, []);

    const handleRRHHJustification = useCallback(() => {
        console.log('Justifying to RRHH...');
        setShowJustificationModal(false);
        // Logic to send justification to HR
    }, []);

    const handleLogout = useCallback(() => {
        console.log('Logging out...');
        // Logic to perform logout
    }, []);

    useEffect(() => {
        // This is where the actual work activity monitoring logic would go.
        // For now, it's a placeholder.
        const interval = setInterval(() => {
            const now = new Date();
            const diffMs = now.getTime() - lastActivity.getTime();
            const diffMinutes = diffMs / (1000 * 60);
            setMinutesSinceLastActivity(diffMinutes);

            // Example: show modal after 10 minutes of inactivity
            if (diffMinutes >= 10 && !showJustificationModal) {
                 setShowJustificationModal(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastActivity, showJustificationModal]);

    return {
        showJustificationModal,
        lastActivity,
        minutesSinceLastActivity,

        handleContinueWork,
        handleRRHHJustification,
        handleLogout,
    };
};

export default useWorkStatusMonitor;
