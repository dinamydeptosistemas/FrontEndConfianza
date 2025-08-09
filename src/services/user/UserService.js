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
 * @param {boolean} [params.usuarioActivo] - Estado del usuario (true=activo, false=inactivo)
 * @param {boolean} [params.usuarioActivoFiltro] - Filtro de estado del usuario (true=activo, false=inactivo)
 * @param {string} [params.tipoUser] - Tipo de usuario (INTERNO/EXTERNO)
 * @param {string} [params.tipoUserFiltro] - Filtro de tipo de usuario (INTERNO/EXTERNO)
 * @param {string} [params.relacionUsuario] - Relación del usuario (EMPLEADO/CLIENTE/PROVEEDOR)
 * @param {string} [params.relacionUsuarioFiltro] - Filtro de relación del usuario (EMPLEADO/CLIENTE/PROVEEDOR)
 * @returns {Promise<Object>} Objeto con usuarios y metadatos de paginación
 */
export const getUsers = async (params = {}) => {
    try {
        const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        const pascalCaseParams = Object.keys(params).reduce((acc, key) => {
            const pascalKey = toPascalCase(key);
            acc[pascalKey] = params[key];
            return acc;
        }, {});

        const requestBody = {
            Process: 'getUsers',
            ...pascalCaseParams
        };

        console.log('Enviando petición a /user/process con:', requestBody);
        const response = await axiosInstance.post(`${API_BASE}/user/process`, requestBody);
        console.log('Respuesta de /user/process:', response.data);

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
    const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const pascalCaseData = Object.keys(userData).reduce((acc, key) => {
        const pascalKey = toPascalCase(key);
        acc[pascalKey] = userData[key];
        return acc;
    }, {});

    const requestBody = {
        Process: 'putUsers',
        ...pascalCaseData
    };

    console.log('Enviando petición (putUser) a /user/process con:', requestBody);
    const response = await axiosInstance.post(`${API_BASE}/user/process`, requestBody);
    return response.data;
};

/**
 * Elimina un usuario por su ID
 * @param {number} idUser - ID del usuario a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteUser = async (idUser) => {
    const requestBody = {
        Process: 'deleteUsers',
        IdUser: idUser
    };
    console.log('Enviando petición (deleteUser) a /user/process con:', requestBody);
    const response = await axiosInstance.post(`${API_BASE}/user/process`, requestBody);
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

/**
 * Sube un archivo de plantilla para importar usuarios
 * @param {FormData} formData - Datos del formulario que incluye el archivo y opciones
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadTemplate = async (formData) => {
    try {
        // Asegurarse de que 'EsActualizacion' sea un string si existe
        if (formData.has('EsActualizacion')) {
            const value = formData.get('EsActualizacion');
            formData.set('EsActualizacion', String(value === 'true' || value === true));
        }

        console.log('Enviando archivo al servidor...');
        const response = await axiosInstance.post('api/user/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json, text/plain, */*'
            },
            responseType: 'blob', // Recibir como blob para manejar errores de archivo y JSON
        });

        if (response.data.type.includes('json')) {
            const jsonResponse = JSON.parse(await response.data.text());
            console.log('Respuesta JSON recibida:', jsonResponse);
            return jsonResponse;
        } else if (response.data.type.includes('text') || response.data.type.includes('octet-stream')) {
            console.log('Respuesta de archivo de error recibida');
            return response.data; // Devolver el blob del archivo de error
        }

        return response.data;

    } catch (error) {
        console.error('Error al subir archivo:', error);
        let errorMessage = 'Error al procesar el archivo';
        if (error.response && error.response.data) {
            try {
                const errorBlob = error.response.data;
                const errorText = await errorBlob.text();
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch (e) {
                // No se pudo parsear el error
            }
        }
        throw new Error(errorMessage);
    }
};

/**
 * Descarga una plantilla de usuarios
 * @param {Object} filters - Filtros para la descarga
 * @returns {Promise<Blob>} Archivo de plantilla
 */
export const downloadTemplate = async (filters = {}) => {
    try {
        const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        const pascalCaseFilters = Object.keys(filters).reduce((acc, key) => {
            const pascalKey = toPascalCase(key);
            acc[pascalKey] = filters[key];
            return acc;
        }, {});

        console.log('Solicitando plantilla con filtros (PascalCase):', pascalCaseFilters);
        const response = await axiosInstance.post('api/user/export', pascalCaseFilters, {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json'
            }
        });

        if (response.data instanceof Blob && response.data.size > 0) {
            return response.data;
        } else {
            throw new Error('La respuesta del servidor no es un archivo válido o está vacío.');
        }
    } catch (error) {
        console.error('Error al descargar plantilla:', error);
        let errorMessage = 'Error al descargar la plantilla';
        if (error.response && error.response.data) {
            try {
                const errorBlob = error.response.data;
                const errorText = await errorBlob.text();
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // El error no es un JSON, puede ser un mensaje de texto plano
            }
        }
        throw new Error(errorMessage);
    }
};

/**
 * Obtiene solo usuarios internos.
 * @param {Object} params - Parámetros de búsqueda adicionales.
 * @returns {Promise<Object>} Objeto con usuarios y metadatos de paginación.
 */
export const getInternalUsers = async (params = {}) => {
    return getUsers({ ...params, tipoUserFiltro: 'INTERNO' });
};

/**
 * Obtiene solo usuarios externos.
 * @param {Object} params - Parámetros de búsqueda adicionales.
 * @returns {Promise<Object>} Objeto con usuarios y metadatos de paginación.
 */
export const getExternalUsers = async (params = {}) => {
    return getUsers({ ...params, tipoUserFiltro: 'EXTERNO' });
};