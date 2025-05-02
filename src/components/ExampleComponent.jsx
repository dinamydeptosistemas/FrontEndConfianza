import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ExampleComponent = () => {
    // Obtener los valores y funciones del contexto
    const { 
        user,          // Datos del usuario actual
        negocio,       // Datos del negocio
        loading,       // Estado de carga
        error,         // Mensajes de error
        login,         // Función para iniciar sesión
        logout,        // Función para abrir el modal de cierre de sesión
        directLogout   // Función para cerrar sesión directamente
    } = useAuth();

    // Ejemplo de uso
    const handleLogout = () => {
        logout(); // Esto abrirá el modal de confirmación
    };

    const handleEmergencyLogout = () => {
        directLogout(); // Esto cerrará la sesión inmediatamente
    };

    const handleLogin = async () => {
        try {
            await login({
                username: 'usuario',
                password: 'contraseña'
            });
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {user ? (
                <>
                    <h2>Bienvenido, {user.username}</h2>
                    <p>Negocio: {negocio?.nombre}</p>
                    <button onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                    <button onClick={handleEmergencyLogout}>
                        Cerrar Sesión de Emergencia
                    </button>
                </>
            ) : (
                <>
                    <p>No has iniciado sesión</p>
                    <button onClick={handleLogin}>
                        Iniciar Sesión
                    </button>
                </>
            )}
        </div>
    );
};

export default ExampleComponent; 