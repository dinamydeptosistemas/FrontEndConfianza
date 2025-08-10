import axios from 'axios';
import axiosInstance from '../../config/axios';

// Configuración de la API usando variables de entorno
const API_BASE = process.env.REACT_APP_PERMISSIONS_API_BASE || '/api/Permissions/Process';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10);

// Validar configuración
if (!process.env.REACT_APP_API_BASE_URL) {
  // REACT_APP_API_BASE_URL no está definido en las variables de entorno
}

// Configuración común para las peticiones
const commonConfig = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Application-Name': 'frontend-confianza',
    'X-Environment': process.env.NODE_ENV || 'development'
  }
};

/**
 * Obtiene la lista de permisos
 * @param {Object} params - Parámetros de búsqueda
 */
export const getPermisos = async (params = {}) => {
  try {
    const requestParams = {
      process: 'getPermissions',
      ...params
    };
    console.log('[PermissionService] Endpoint:', API_BASE);
    console.log('[PermissionService] Params:', JSON.stringify(requestParams));
    const response = await axiosInstance.post(API_BASE, requestParams, commonConfig);
    
    if (!response?.data) {
      throw new Error('No se recibieron datos en la respuesta del servidor');
    }
    
    return response.data;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Error al obtener permisos: ${errorMessage}`);
    }
    throw error;
  }
};

/**
 * Crea o actualiza un permiso
 * @param {Object} permiso - Datos del permiso
 */
/**
 * Crea o actualiza un permiso
 * @param {Object} permiso - Datos del permiso a guardar
 * @returns {Promise<Object>} - Respuesta del servidor
 * @throws {Error} - Si hay un error en la petición
 */
export const putPermiso = async (permiso) => {
  try {
    // Normalize the permission object to ensure consistent field names
    const normalizedPermiso = {
      ...permiso,
      // Ensure consistent casing for all fields
      Process: 'putPermissions',
      // Remove any potential duplicate fields with different cases
      ...(permiso.regPermiso && { regPermiso: permiso.regPermiso }),
      ...(permiso.idUser && { idUser: permiso.idUser }),
      ...(permiso.idFunction && { idFunction: permiso.idFunction }),
      ...(permiso.codigoEntidad && { codigoEntidad: permiso.codigoEntidad }),
      ...(permiso.estadoPermisoActivado !== undefined && { estadoPermisoActivado: permiso.estadoPermisoActivado }),
      ...(permiso.permitirTodasEmpresas !== undefined && { permitirTodasEmpresas: permiso.permitirTodasEmpresas }),
      ...(permiso.permitirMasDeUnaSesion !== undefined && { permitirMasDeUnaSesion: permiso.permitirMasDeUnaSesion }),
      ...(permiso.cierreSesionJornada && { cierreSesionJornada: permiso.cierreSesionJornada }),
      ...(permiso.bloqueoSesionMaxima && { bloqueoSesionMaxima: permiso.bloqueoSesionMaxima }),
      ...(permiso.userioResponsable && { userioResponsable: permiso.userioResponsable }),
      ...(permiso.fechaInicioPermiso && { fechaInicioPermiso: permiso.fechaInicioPermiso }),
      ...(permiso.fechaFinalPermiso && { fechaFinalPermiso: permiso.fechaFinalPermiso })
    };
    
    // Remove any potential duplicate fields with different cases
    const { process, Process, UserioResponsable, CodigoEntidad, ...rest } = normalizedPermiso;
    const requestParams = {
      Process: Process || 'putPermissions',
      ...rest
    };
    
    const response = await axiosInstance.post(API_BASE, requestParams, commonConfig);
    
    if (!response || !response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    // Si la respuesta es exitosa pero viene en formato de texto
    if (typeof response.data === 'string') {
      try {
        // Intentar parsear como JSON
        const parsedData = JSON.parse(response.data);
        return { success: true, ...parsedData };
      } catch (e) {
        // Si no es JSON, devolver como mensaje
        return { success: true, message: response.data };
      }
    }
    
    // Si ya es un objeto, asegurarse de que tenga success: true
    return { success: true, ...response.data };
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'object' 
        ? errorData.message || JSON.stringify(errorData)
        : errorData || error.message;
      
      // Si el servidor devuelve un mensaje de error detallado, mostrarlo
      if (errorData && typeof errorData === 'object') {
        throw new Error(`Error al guardar el permiso (${error.response?.status}): ${JSON.stringify(errorData)}`);
      }
      
      throw new Error(`Error al guardar el permiso: ${errorMessage}`);
    }
    throw error;
  }
};

/**
 * Elimina un permiso
 * @param {number} regPermiso - ID del permiso a eliminar
 */
/**
 * Elimina un permiso
 * @param {number} regPermiso - ID del permiso a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 * @throws {Error} - Si hay un error en la petición
 */
export const deletePermiso = async (regPermiso) => {
  try {
    // Ensure regPermiso is a number
    const permisoId = Number(regPermiso);
    if (isNaN(permisoId)) {
      throw new Error('ID de permiso no válido');
    }
    
    const response = await axiosInstance.post(API_BASE, {
      process: 'deletePermissions',
      regPermiso: permisoId
    });
    
    return response.data;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Error al eliminar el permiso: ${errorMessage}`);
    }
    throw error;
  }
};
