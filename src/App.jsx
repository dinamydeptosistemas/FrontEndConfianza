import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterUserInternal from './pages/registrer/RegisterUserInternal';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública realmente fuera del AuthProvider */}
                <Route path="/registrar-usuario-interno" element={<RegisterUserInternal />} />
                {/* Todas las demás rutas, incluyendo /login, dentro del AuthProvider */}
                <Route path="/*" element={
                    <AuthProvider>
                        <NotificationProvider>
                            <AppRoutes />
                        </NotificationProvider>
                    </AuthProvider>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;