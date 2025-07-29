import axiosInstance from '../../config/axios';
const API_BASE = '/api';

/**
 * Obtiene la lista de perfiles de acceso
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page] - Número de página
 * @param {number} [params.idFunction] - ID del perfil de acceso (opcional)
 */
export const getPerfilesAcceso = async (params = {}) => {
  try {
    const requestParams = {
      process: 'getAccessProfiles',
      ...params
    };
    const response = await axiosInstance.post(`${API_BASE}/accessprofiles/process`, requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea o actualiza un perfil de acceso
 * @param {Object} perfil - Datos del perfil de acceso
 * @param {number} [perfil.idFunction] - ID del perfil (requerido para actualización)
 * @param {string} [perfil.functionName] - Nombre de la función (requerido para creación)
 * @param {boolean} [perfil.grantPermissions] - Permiso general
 * ...otros campos de permisos...
 */
export const putPerfilAcceso = async (perfil) => {
  const response = await axiosInstance.post(API_BASE + '/accessprofiles/process', {
    process: 'putAccessProfiles',
    ...perfil
  });
  return response.data;
};

/**
 * Elimina un perfil de acceso
 * @param {number} idFunction - ID del perfil de acceso a eliminar
 */
export const deletePerfilAcceso = async (idFunction) => {
  const response = await axiosInstance.post(API_BASE + '/accessprofiles/process', {
    process: 'deleteAccessProfiles',
    idFunction
  });
  return response.data;
};

/**
 * Descarga una plantilla de perfiles de acceso en formato Excel
 * @param {Object} filters - Filtros para la descarga
 * @param {string} [filters.process] - Proceso
 * @param {number} [filters.page=0] - Página (0 para todos los registros)
 * @returns {Promise<Blob>} Archivo de Excel
 */
export const downloadTemplate = async (filters = {}) => {
  try {
    console.log('Solicitando plantilla de perfiles de acceso con filtros:', filters);
    // Asegurar que la URL esté correcta (con mayúscula inicial en 'AccessProfiles')
    const response = await axiosInstance.post('api/AccessProfiles/Export', filters, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    // Verificar si la respuesta es un blob válido
    if (response.data instanceof Blob) {
      return response.data;
    } else {
      // Si no es un blob, intentar parsear como JSON para obtener el mensaje de error
      const text = await response.data.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Error al procesar la plantilla');
      } catch (e) {
        throw new Error('La respuesta del servidor no es válida');
      }
    }
  } catch (error) {
    console.error('Error al descargar plantilla:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    let errorMessage = 'Error al descargar la plantilla';
    
    if (error.response) {
      // El servidor respondió con un estado de error
      if (error.response.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
      } else if (error.response.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.response.status === 404) {
        errorMessage = 'El recurso solicitado no existe.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intente más tarde.';
      }
      
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      if (error.response.data) {
        try {
          const errorData = typeof error.response.data === 'object' 
            ? error.response.data 
            : JSON.parse(error.response.data);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear como JSON, usar el texto plano
          errorMessage = error.response.data.message || error.response.data || errorMessage;
        }
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }
    
    const errorWithMessage = new Error(errorMessage);
    errorWithMessage.originalError = error;
    throw errorWithMessage;
  }
};

/**
 * Sube un archivo de plantilla para importar perfiles de acceso
 * @param {FormData} formData - Datos del formulario que incluye el archivo y opciones
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadTemplate = async (formData) => {
  try {
    // Inspeccionar el FormData para depuración
    console.log('FormData contiene las siguientes claves:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'Archivo' ? 'Archivo seleccionado' : pair[1]));
    }
    
    // Asegurarse de que la URL esté correcta con mayúsculas iniciales
    // Según el controlador backend, siempre es el mismo endpoint: api/AccessProfiles/Import
    // El parámetro EsActualizacion determina si se actualiza o se crea
    const response = await axiosInstance.post('api/AccessProfiles/Import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Evita redirecciones
      },
      responseType: 'json', // Forzar respuesta JSON
      validateStatus: function (status) {
        // Aceptar cualquier código de estado para poder manejar errores
        return true;
      }
    });

    console.log('Respuesta recibida del servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });

    // Verificar el código de estado HTTP
    if (response.status >= 200 && response.status < 300) {
      // Verificar si la respuesta es un JSON válido
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      return { message: 'Operación completada exitosamente' };
    }
    
    // Manejar errores según el código de estado
    let errorMessage = 'Error en el servidor';
    
    if (response.status === 400) {
      errorMessage = response.data?.message || response.data?.error || 'Datos del formulario inválidos';
    } else if (response.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
    } else if (response.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción.';
    } else if (response.status === 404) {
      errorMessage = 'El recurso no fue encontrado en el servidor.';
    } else if (response.status >= 500) {
      errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Error detallado al subir archivo:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    let errorMessage = 'Error al subir el archivo';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || error.response.data?.error || 'Datos del formulario inválidos';
      } else if (error.response.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intente más tarde.';
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }
    
    const errorWithMessage = new Error(errorMessage);
    errorWithMessage.originalError = error;
    throw errorWithMessage;
  }
};