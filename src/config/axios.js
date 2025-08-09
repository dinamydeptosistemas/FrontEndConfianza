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


// Interceptor para agregar headers de no-cache a todas las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        // Disparar evento de actividad de API para todas las peticiones
        if (config.url && !config.url.includes('/api/WorkStatus/status')) {  // Excluir el propio endpoint de verificación
            dispatchApiActivity();
        }
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

// Disparador de eventos personalizado para actividad de API
const dispatchApiActivity = () => {
    const event = new CustomEvent('apiActivity');
    window.dispatchEvent(event);
};

// Interceptor para manejar errores de autenticación (ahora más flexible)
axiosInstance.interceptors.response.use(
    response => {
        // Disparar evento de actividad de API para respuestas exitosas
        if (!response.config.url.includes('/api/WorkStatus/status')) {  // Excluir el propio endpoint de verificación
            dispatchApiActivity();
        }
        return response;
    },
    error => {
        // Dejar que AuthContext decida cómo manejar los 401.
        // Solo en caso de que *no* exista AuthContext (por ejemplo, peticiones sueltas antes de montar la app)
        // realizamos una redirección mínima.
        if (error.response?.status === 401 && !window.AuthContextMounted) {
            if (!window.location.pathname.includes('/login')) {
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 