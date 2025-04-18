import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';

// Configuración de axios con retry
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 10000 // 10 segundos de timeout
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('[authService] Enviando petición a:', config.url);
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

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('[authService] Respuesta recibida:', response.status);
        return response;
    },
    (error) => {
        console.error('[authService] Error completo:', error);
        
        if (error.code === 'ERR_NETWORK') {
            throw new Error('No se pudo conectar al servidor. Por favor, verifica tu conexión y que el servidor esté funcionando.');
        }
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Error en el servidor';
        
        throw new Error(errorMessage);
    }
);

const authService = {
    async login(credentials) {
        try {
            console.log('[authService] Intentando login con credenciales:', {
                ...credentials,
                password: credentials.password ? '[PROTECTED]' : undefined
            });
            
            const response = await axiosInstance.post('/Auth/Login', {
                username: credentials.username || '',
                password: credentials.password || '',
                email: credentials.email || '',
                dni: credentials.dni || '',
                userType: credentials.userType
            });

            console.log('[authService] Respuesta recibida:', response);

            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }

            if (response.data.success) {
                const userData = {
                    userId: response.data.userId,
                    username: response.data.username,
                    email: response.data.email,
                    userType: credentials.userType
                };
                
                console.log('[authService] Login exitoso, guardando datos:', userData);
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                return response.data;
            } else {
                throw new Error(response.data.message || 'Credenciales inválidas');
            }
        } catch (error) {
            console.error('[authService] Error detallado:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    async logout() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axiosInstance.post('/Auth/CloseSession', { userId: user.userId });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
        }
    },

    async verifyToken() {
        try {
            const response = await axiosInstance.post('/Auth/VerifyToken');
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            throw new Error(error.response?.data?.message || 'Token inválido');
        }
    },

    async getUserInfo() {
        try {
            const response = await axiosInstance.get('/Auth/GetUserInfo');
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
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    }
};

export default authService; 