import axiosInstance from '../../config/axios';

const API_BASE = '/api/paperworks/process';

/**
 * Obtiene la lista de trámites
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page] - Número de página
 * @param {string} [params.searchTerm] - Término de búsqueda
 * @param {string} [params.regTramite] - ID del trámite
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const getPaperworks = async (params = {}) => {
    try {
        // Asegurarnos de que params sea un objeto
        const requestParams = {
            process: 'getPaperworks',
            ...params
        };

        // Realizar la petición
        const response = await axiosInstance.post(API_BASE, requestParams);
        
        return response.data;
  } catch (error) {
    throw error;
  }
};

