import axiosInstance from '../../config/axios';

const API_BASE = '/api';    

// Log de la configuración de axios
console.log('Configuración de axios:', {
    baseURL: axiosInstance.defaults.baseURL,
    headers: axiosInstance.defaults.headers,
    timeout: axiosInstance.defaults.timeout
});

/**
 * Obtiene usuarios con soporte para paginación y filtros
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page] - Número de página
 * @param {string} [params.searchTerm] - Término de búsqueda
 * @param {number} [params.idUser] - ID de usuario específico
 * @param {string} [params.fechaRegistro] - Fecha de registro específica
 * @param {string} [params.fechaRegistroDesde] - Fecha de registro desde
 * @param {string} [params.fechaRegistroHasta] - Fecha de registro hasta
 * @param {number} [params.usuarioActivo] - Estado del usuario (1=activo, 0=inactivo)
 * @param {string} [params.tipoUser] - Tipo de usuario (INTERNO/EXTERNO)
 * @param {string} [params.relacionUsuario] - Relación del usuario (EMPLEADO/CLIENTE/PROVEEDOR)
 * @returns {Promise<Object>} Objeto con usuarios y metadatos de paginación
 */
export const getUsers = async (params = {}) => {
    try {
        // Validar y limpiar parámetros para evitar errores 400
        const cleanParams = {};
        
        // Copiar solo los parámetros válidos y no undefined/null
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanParams[key] = value;
            }
        });
        
        // Asegurarnos de que params sea un objeto y contenga el proceso
        const requestParams = {
            process: 'getUsers',
            ...cleanParams
        };

        // Log de la petición
        console.log('Enviando petición a /user/process con:', requestParams);
        console.log('URL completa:', `${axiosInstance.defaults.baseURL}${API_BASE}/users/process`);
        console.log('Headers de la petición:', axiosInstance.defaults.headers);

        // Realizar la petición
        const response = await axiosInstance.post(`${API_BASE}/user/process`, requestParams);
        
        // Log de la respuesta
        console.log('Respuesta recibida:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error en getUsers:', error);
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Detalles del error de respuesta:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    data: error.config?.data
                }
            });
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
        } else {
            // Algo sucedió al configurar la petición
            console.error('Error al configurar la petición:', error.message);
        }
        throw error;
    }
};

/**
 * Crea o actualiza un usuario
 * @param {Object} userData - Datos del usuario
 * @param {number} [userData.idUser] - ID del usuario (opcional, si se proporciona es actualización)
 * @param {string} [userData.nombreUser] - Nombre del usuario
 * @param {string} [userData.apellidosUser] - Apellidos del usuario
 * @param {string} [userData.identificacion] - Identificación del usuario
 * @param {boolean} [userData.usuarioActivo] - Estado del usuario
 * @param {string} userData.username - Nombre de usuario (requerido para creación)
 * @param {number} [userData.passNumber] - Número de contraseña
 * @param {string} [userData.password] - Contraseña
 * @param {string} [userData.emailUsuario] - Email del usuario
 * @param {string} [userData.celularUsuario] - Celular del usuario
 * @param {boolean} [userData.sms] - Preferencia SMS
 * @param {boolean} [userData.whatsap] - Preferencia WhatsApp
 * @param {string} [userData.tipoUser] - Tipo de usuario
 * @param {string} [userData.relacionUsuario] - Relación del usuario
 * @param {string} [userData.codeEntity] - Código de entidad
 * @returns {Promise<Object>} Usuario creado/actualizado
 */
export const putUser = async (userData) => {
    const response = await axiosInstance.post(`${API_BASE}/user/process`, {
        process: 'putUsers',
        ...userData
    });
    return response.data;
};

/**
 * Elimina un usuario por su ID
 * @param {number} idUser - ID del usuario a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteUser = async (idUser) => {
    const response = await axiosInstance.post(`${API_BASE}/user/process`, {
        process: 'deleteUsers',
        idUser
    });
    return response.data;
};

/**
 * Obtiene un usuario por su ID
 * @param {number} id - El ID del usuario
 * @returns {Promise<Object>} El usuario encontrado
 */
export const getUser = async (id) => {
    return getUsers(1, id);
};