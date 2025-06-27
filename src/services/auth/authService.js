// Configuración base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';
const API_BASE = `${API_URL}/api`;

// Variable para controlar si ya estamos en proceso de logout
let isLoggingOut = false;

/**
 * Función para limpiar el estado de la sesión
 */
const clearSession = () => {
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar cookies
    document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
};

/**
 * Función para manejar el logout de manera segura
 */
const handleLogout = async (isAutomatic = false) => {
    // Evitar múltiples llamadas a logout
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
        // Solo llamar al endpoint de logout si no es un logout automático
        if (!isAutomatic) {
            await fetchWithConfig('/auth/logout-cookie', {
                method: 'POST'
            });
        }

        // Limpiar el estado de la sesión
        clearSession();

        // Redirigir al login solo si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
            window.location.replace('/login');
        }
    } catch (error) {
        console.error('Error durante el logout:', error);
        // Aún así, limpiar la sesión y redirigir
        clearSession();
        if (!window.location.pathname.includes('/login')) {
            window.location.replace('/login');
        }
    } finally {
        // Resetear el flag después de un breve delay
        setTimeout(() => {
            isLoggingOut = false;
        }, 1000);
    }
};

/**
 * Configuración base para las peticiones fetch
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta procesada
 */
const fetchWithConfig = async (url, options = {}) => {
    const fullUrl = `${API_BASE}${url}`;
    const token = localStorage.getItem('token');
    
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

        // Manejo de errores HTTP
        if (!response.ok) {
            if (response.status === 401) {
                // Manejar expiración de sesión
                await handleLogout(true);
                throw new Error('Sesión expirada');
            }
            throw new Error(data.message || 'Error en el servidor');
        }

        return data;
    } catch (error) {
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

            // Verificar si la respuesta es exitosa (usando Success con S mayúscula)
            if (!response.Success) {
                throw new Error(response.Message || 'Error en la autenticación');
            }

            // Limpiar las barras invertidas de los permisos
            let cleanPermissions = response.Permissions;
            if (cleanPermissions) {
                try {
                    // Si es un string, limpiar las barras invertidas
                    if (typeof cleanPermissions === 'string') {
                        cleanPermissions = cleanPermissions.replace(/\\/g, '');
                        // Intentar parsear el JSON limpio
                        cleanPermissions = JSON.parse(cleanPermissions);
                    }
                } catch (error) {
                    console.error('[authService] Error al limpiar permisos:', error);
                }
            }

            // Crear objeto de usuario con solo los campos necesarios
            const userData = {
                userId: response.UserId,
                username: response.Username,
                userFunction: response.UserFunction,
                codeFunction: response.CodeFunction,
                codeEntity: response.CodeEntity,
                nameEntity: response.NameEntity,
                permissions: cleanPermissions,
                tipoUsuario: response.TipoUsuario,
                estadousuario: response.estadousuario
            };

            // Guardar token y datos esenciales
            localStorage.setItem('token', response.TokenSession);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userId', response.UserId);
            localStorage.setItem('negocio', response.NameEntity);
            
            // Determinar la ruta de redirección según el tipo de usuario y función
            let redirectPath = '/login';
            if (response.TipoUsuario === 'INTERNO') {
                switch (response.CodeFunction) {
                    case 1:
                        redirectPath = '/dashboard/internal';
                        break;
                    case 2:
                        redirectPath = '/dashboard/gerencia';
                        break;
                    case 3:
                        redirectPath = '/dashboard-lighter/contador';
                        break;
                    case 4:
                        redirectPath = '/dashboard-lighter/supervisor';
                        break;
                    case 5:
                        redirectPath = '/dashboard-lighter/auxiliar';
                        break;
                    case 6:
                        redirectPath = '/dashboard-lighter/cajero';
                        break;
                    case 7:
                        redirectPath = '/dashboard-lighter/vendedor';
                        break;
                    default:
                        redirectPath = '/dashboard';
                }
            } else if (response.TipoUsuario === 'EXTERNO') {
                redirectPath = '/dashboard-lighter/externo';
            }
            
            // Si existe globalState disponible, actualizar el estado global
            if (typeof window !== 'undefined' && window.globalState) {
                window.globalState.setLoginResponse?.(response);
                window.globalState.setUser?.(userData);
                window.globalState.setUserId?.(response.UserId);
            }
            
            return {
                success: true,
                message: response.Message || 'Inicio de sesión exitoso',
                statusCode: response.StatusCode,
                userId: response.UserId,
                username: response.Username,
                userFunction: response.UserFunction,
                codeFunction: response.CodeFunction,
                codeEntity: response.CodeEntity,
                nameEntity: response.NameEntity,
                permissions: cleanPermissions,
                estadousuario: response.estadousuario,
                tipoUsuario: response.TipoUsuario,
                token: response.TokenSession,
                newBitacoraRegAcceso: response.NewBitacoraRegAcceso,
                redirectTo: redirectPath
            };

        } catch (error) {
            // Limpiar cualquier dato de sesión en caso de error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('negocio');
            
            throw new Error(error.message || 'Error en la autenticación. Por favor, verifica tus credenciales.');
        }
    },

    /**
     * Determina la ruta de redirección según el tipo de usuario
     * @param {Object} userData - Datos del usuario
     * @returns {string} Ruta de redirección
     */
    getRedirectPath(userData) {
        if (userData.tipoUsuario === 'INTERNO') {
            return '/dashboard/internal';
        } else if (userData.tipoUsuario === 'EXTERNO') {
            return '/dashboard/external';
        }
        return '/login';
    },

    async logout(options = {}) {
        await handleLogout(false);
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
        return user?.tipoUsuario === 'INTERNO';
    },

    /**
     * Verifica si el usuario es externo
     * @returns {boolean} True si es usuario externo
     */
    isExternalUser() {
        const user = this.getCurrentUser();
        return user?.tipoUsuario === 'EXTERNO';
    },

    /**
     * Verifica si el usuario es administrador
     * @returns {boolean} True si es administrador
     */
    isAdminUser() {
        const user = this.getCurrentUser();
        return user?.tipoUsuario === 'INTERNO' && user?.codeFunction === 1;
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
            // Intentar limpiar incluso si hay error
            localStorage.clear();
            throw error;
        }
    }
};

export default authService; 