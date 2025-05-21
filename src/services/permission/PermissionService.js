import axiosInstance from '../../config/axios';
const API_BASE = '/api/Permissions/Process';

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
    const response = await axiosInstance.post(API_BASE, requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea o actualiza un permiso
 * @param {Object} permiso - Datos del permiso
 */
export const putPermiso = async (permiso) => {
  const requestParams = {
    process: 'putPermissions',
    ...permiso
  };
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};

/**
 * Elimina un permiso
 * @param {number} regPermiso - ID del permiso a eliminar
 */
export const deletePermiso = async (regPermiso) => {
  const requestParams = {
    process: 'deletePermissions',
    regPermiso
  };
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};
