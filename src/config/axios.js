import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5201',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Variable para controlar si ya estamos en proceso de redirección
let isRedirecting = false;

// Interceptor para agregar headers de no-cache a todas las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        // Agrega el token si existe
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Solo manejamos errores 401 si no estamos ya redirigiendo
        if (error.response?.status === 401 && !isRedirecting) {
            // Evitamos redirecciones múltiples
            isRedirecting = true;
            
            // Limpiar el estado de autenticación
            localStorage.removeItem('token');
            
            // Solo redirigimos si no estamos en una ruta pública
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/validate-email') && 
                !window.location.pathname.includes('/registrar-usuario-interno') && 
                !window.location.pathname.includes('/registrar-usuario-externo')) {
                // Usamos replace en lugar de href para evitar que el usuario pueda volver atrás
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 