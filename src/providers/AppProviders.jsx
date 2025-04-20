import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

export const AppProviders = ({ children }) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                {children}
            </AuthProvider>
        </BrowserRouter>
    );
}; 