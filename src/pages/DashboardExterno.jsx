import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importar desde el contexto correcto

const DashboardExterno = () => {
    const { logout } = useAuth();
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard de Usuario Externo</h1>
            <p>Bienvenido al panel de control para usuarios externos.</p>
            <button 
                onClick={logout}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default DashboardExterno; 