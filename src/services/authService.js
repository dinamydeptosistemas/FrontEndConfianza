import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 50000
});

// Interceptor para logs de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('[authService] Enviando petición:', {
            url: fullUrl,
            method: config.method,
            data: config.data
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[authService] Error en la petición:', error);
        return Promise.reject(error);
    }
);

// Interceptor para logs de respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('[authService] Respuesta recibida:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('[authService] Error detallado:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });

        if (error.code === 'ERR_NETWORK') {
            throw new Error(`No se pudo conectar al servidor (${API_URL}). Por favor, verifica tu conexión y que el servidor esté funcionando.`);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error(error.response.data?.message || 'Credenciales inválidas');
        }

        throw new Error(error.response?.data?.message || error.message || 'Error en el servidor');
    }
);

const authService = {
    async login(credentials) {
        try {
            console.log('[authService] Intentando login con:', {
                ...credentials,
                password: '[PROTECTED]'
            });

            // Asegurarnos de que los campos coincidan exactamente con el DTO del backend
            const loginData = {
                username: credentials.username || '',
                password: credentials.password || '',
                email: credentials.email || '',
                dni: credentials.dni || '',
                userType: credentials.userType
            };

            const response = await axiosInstance.post('/Auth/login', loginData);

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    userId: response.data.userId,
                    username: response.data.username,
                    email: response.data.email,
                    userType: credentials.userType,
                    permissions: response.data.permissions
                }));
                return response.data;
            }

            throw new Error(response.data.message || 'Error en la autenticación');
        } catch (error) {
            console.error('[authService] Error en login:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axiosInstance.post('/Auth/logout', { 
                userId: user.userId 
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
        }
    },

    async verifyToken() {
        try {
            const response = await axiosInstance.get('/Auth/verify-token');
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            throw new Error(error.response?.data?.message || 'Token inválido');
        }
    },

    async getUserInfo() {
        try {
            const response = await axiosInstance.get('/Auth/user-info');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener información del usuario');
        }
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user?.permissions) return false;
        return user.permissions[permission] === true;
    }
};

export default authService; 