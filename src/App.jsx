import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';

const AppContent = () => {
    useSessionTimeout(); // Implementar el timeout de sesión
    return <AppRoutes />;
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App; 