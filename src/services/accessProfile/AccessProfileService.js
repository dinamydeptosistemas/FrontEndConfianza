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