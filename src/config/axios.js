import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7001',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Interceptor para agregar headers de no-cache a todas las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
    (response) => {
        // Asegurarse de que la respuesta no se guarde en caché
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        response.headers['Pragma'] = 'no-cache';
        response.headers['Expires'] = '0';
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Limpiar localStorage
            localStorage.clear();
            // No intentamos limpiar cookies desde JavaScript
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 