import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterUserInternal from './pages/registrer/RegisterUserInternal';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfigProvider } from './contexts/ConfigContext';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ConfigProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <Routes>
                                {/* Ruta pública realmente fuera del AuthProvider */}
                                <Route path="/registrar-usuario-interno" element={<RegisterUserInternal />} />
                                {/* Todas las demás rutas, incluyendo /login, dentro del AuthProvider */}
                                <Route path="/*" element={<AppRoutes />} />
                            </Routes>
                        </NotificationProvider>
                    </AuthProvider>
                </ConfigProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
};

export default App;