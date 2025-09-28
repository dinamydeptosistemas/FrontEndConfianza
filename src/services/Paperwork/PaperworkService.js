import axiosInstance from '../../config/axios';

const API_BASE = '/api/paperworks/process';

/**
 * Obtiene la lista de trámites
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page] - Número de página
 * @param {string} [params.searchTerm] - Término de búsqueda
 * @param {string} [params.regTramite] - ID del trámite
 * @param {string} [params.estadoTramite] - Estado del trámite (Aprobado, Rechazado, Por Procesar)
 * @param {string} [params.relacionUser] - Relación del usuario
 * @param {string} [params.tipoUser] - Tipo de usuario
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
        
        // Procesar la respuesta para asegurar que los contadores están disponibles
        const data = response.data;
        
        
        // Asegurar que los contadores existan en el formato esperado
        const processedData = {
            ...data,
            // Si CountAprobado existe, usarlo; de lo contrario buscar en otros campos o usar 0
            CountAprobado: data.CountAprobado !== undefined ? data.CountAprobado : 
                          (data.countAprobado !== undefined ? data.countAprobado : 
                           (data.tramitesAprobados !== undefined ? data.tramitesAprobados : 0)),
            
            // Si CountRechazado existe, usarlo; de lo contrario buscar en otros campos o usar 0
            CountRechazado: data.CountRechazado !== undefined ? data.CountRechazado : 
                           (data.countRechazado !== undefined ? data.countRechazado : 
                            (data.tramitesRechazados !== undefined ? data.tramitesRechazados : 0)),
            
            // Si CountPorProcesar existe, usarlo; de lo contrario buscar en otros campos o usar 0
            CountPorProcesar: data.CountPorProcesar !== undefined ? data.CountPorProcesar : 
                             (data.countPorProcesar !== undefined ? data.countPorProcesar : 0)
        };
        
       
        return processedData;
    } catch (error) {
       
        throw error;
    }
};

/**
 * Actualiza un trámite existente
 * @param {Object} paperwork - Datos del trámite a actualizar
 * @param {number} paperwork.regTramite - ID del trámite
 * @param {string} paperwork.estadoTramite - Nuevo estado del trámite (Aprobado, Rechazado, Por Procesar)
 * @param {string} [paperwork.responsableAprobacion] - Responsable de la aprobación
 * @param {string} [paperwork.novedad] - Novedad o comentario sobre el trámite
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const putPaperwork = async (paperwork) => {
    try {
        // Validar que el trámite tenga un ID
        if (!paperwork || !paperwork.regTramite) {
            throw new Error('El ID del trámite es requerido');
        }

        // Validar que el estado sea uno de los permitidos
        const estadosValidos = ['Aprobado', 'Rechazado', 'Por Procesar'];
        if (paperwork.estadoTramite && !estadosValidos.includes(paperwork.estadoTramite)) {
            throw new Error('Estado de trámite no válido. Use: Aprobado, Rechazado, Por Procesar');
        }

        // Preparar los datos para la petición
        const requestParams = {
            process: 'putPaperwork',
            ...paperwork
        };

        // Realizar la petición
        const response = await axiosInstance.post(API_BASE, requestParams);
        
        return response.data;
    } catch (error) {
       
        throw error;
    }
};

