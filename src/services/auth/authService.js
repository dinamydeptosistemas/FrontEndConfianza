// Configuración base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';
const API_BASE = `${API_URL}/api`;

/**
 * Configuración base para las peticiones fetch
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta procesada
 */
const fetchWithConfig = async (url, options = {}) => {
    const fullUrl = `${API_BASE}${url}`;
    const token = localStorage.getItem('token');
    
    // Log de la petición
    console.log('[authService] Enviando petición:', {
        url: fullUrl,
        method: options.method || 'GET',
        data: options.body
    });

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            credentials: 'include'
        });

        const data = await response.json();
        
        // Log de la respuesta
        console.log('[authService] Respuesta recibida:', {
            status: response.status,
            data
        });

        // Manejo de errores HTTP
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                throw new Error('Sesión expirada o credenciales inválidas');
            }
            throw new Error(data.message || 'Error en el servidor');
        }

        return data;
    } catch (error) {
        console.error('[authService] Error detallado:', error);
        
        if (!navigator.onLine) {
            throw new Error(`No se pudo conectar al servidor (${API_URL}). Por favor, verifica tu conexión a internet.`);
        }
        
        throw error;
    }
};

const authService = {
    /**
     * Realiza el login del usuario
     * @param {Object} credentials - Credenciales del usuario
     * @param {string} credentials.username - Nombre de usuario
     * @param {string} credentials.password - Contraseña
     * @param {string} credentials.email - Correo electrónico (opcional)
     * @param {string} credentials.dni - DNI (opcional)
     * @param {number} credentials.userType - Tipo de usuario (1: interno, 2: externo)
     * @param {string} credentials.ventanaInicio - Ruta actual de la aplicación
     * @returns {Promise<Object>} Datos del usuario y token
     */
    async login(credentials) {
        try {
            console.log('[authService] Intentando login con:', {
                ...credentials,
                password: '[PROTECTED]'
            });

            const loginData = {
                username: credentials.username || '',
                password: credentials.password || '',
                email: credentials.email || '',
                dni: credentials.dni || '',
                userType: credentials.userType,
                ventanaInicio: credentials.ventanaInicio || '/login'
            };

            const response = await fetchWithConfig('/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginData)
            });

            if (response.success) {
                const userData = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    userType: credentials.userType,
                    userFunction: response.userFunction,
                    permissions: response.permissions
                };

                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('negocio', response.nameEntity);
                return {
                    ...response,
                    redirectTo: this.getRedirectPath(userData)
                };
            }

            throw new Error(response.message || 'Error en la autenticación');
        } catch (error) {
            console.error('[authService] Error en login:', error);
            throw error;
        }
    },

    /**
     * Determina la ruta de redirección según el tipo de usuario
     * @param {Object} userData - Datos del usuario
     * @returns {string} Ruta de redirección
     */
    getRedirectPath(userData) {
        if (userData.userType === 1) {
            return '/dashboard/internal';
        } else if (userData.userType === 2) {
            return '/dashboard/external';
        }
        return '/login';
    },

    /**
     * Cierra la sesión del usuario
     * @param {Object} options - Opciones de cierre de sesión
     * @param {string} options.ventanaInicio - Ruta actual de la aplicación
     * @returns {Promise<Object>} Resultado del cierre de sesión
     */
    async logout(options = {}) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetchWithConfig('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ 
                    userId: user.userId,
                    userType: user.userType,
                    token: localStorage.getItem('token'),
                    ventanaInicio: options.ventanaInicio || '/login'
                })
            });
            
            // Limpiar todo el localStorage
            localStorage.clear();
            
            // Limpiar cookies
            document.cookie.split(";").forEach(cookie => {
                const [name] = cookie.split("=");
                document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });

            // Redirigir al login
            window.location.href = '/login';

            return response;
        } catch (error) {
            // Aún si hay error, limpiar todo y redirigir
            localStorage.clear();
            window.location.href = '/login';
            throw new Error(error.message || 'Error al cerrar sesión');
        }
    },

    /**
     * Verifica la validez del token actual
     * @returns {Promise<Object>} Estado del token
     */
    async verifyToken() {
        try {
            return await fetchWithConfig('/auth/verify-token');
        } catch (error) {
            localStorage.removeItem('token');
            throw new Error(error.message || 'Token inválido');
        }
    },

    /**
     * Obtiene el usuario actual del localStorage
     * @returns {Object|null} Datos del usuario o null
     */
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Verifica si el usuario tiene un permiso específico
     * @param {string} permission - Nombre del permiso
     * @returns {boolean} True si tiene el permiso
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user?.permissions) return false;
        
        // Verificar tanto el formato original como el nuevo
        const permissionKey = permission + 'Access';
        return user.permissions[permissionKey] === true || 
               user.permissions[permission] === true;
    },

    /**
     * Verifica si el usuario es interno
     * @returns {boolean} True si es usuario interno
     */
    isInternalUser() {
        const user = this.getCurrentUser();
        return user?.userType === 1;
    },

    /**
     * Verifica si el usuario es externo
     * @returns {boolean} True si es usuario externo
     */
    isExternalUser() {
        const user = this.getCurrentUser();
        return user?.userType === 2;
    },

    /**
     * Verifica si el usuario es administrador
     * @returns {boolean} True si es administrador
     */
    isAdminUser() {
        const user = this.getCurrentUser();
        return user?.userType === 1 && user?.userFunction === 1;
    },

    /**
     * Maneja el proceso completo de cierre de sesión
     * @param {Object} options - Opciones de cierre de sesión
     * @param {string} options.ventanaInicio - Ruta actual de la aplicación
     * @returns {Promise<boolean>} True si el cierre fue exitoso
     */
    async handleLogout(options = {}) {
        try {
            const response = await this.logout(options);
            
            if (response.success) {
                // Verificar que todo se haya limpiado
                const isClean = !localStorage.getItem('token') && 
                              !localStorage.getItem('user') && 
                              !localStorage.getItem('lastActivity') &&
                              !localStorage.getItem('negocio');

                if (!isClean) {
                    // Forzar limpieza si algo quedó
                    localStorage.clear();
                }
                
                return true;
            }
            
            throw new Error(response.message || 'Error al cerrar la sesión');
        } catch (error) {
            console.error('[authService] Error en handleLogout:', error);
            // Intentar limpiar incluso si hay error
            localStorage.clear();
            throw error;
        }
    }
};

export default authService; 