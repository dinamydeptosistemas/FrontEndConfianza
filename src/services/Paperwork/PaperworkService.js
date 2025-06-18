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

/**
 * Crea o actualiza un trámite
 * @param {Object} paperwork - Datos del trámite
 * @param {number} paperwork.regTramite - ID del trámite
 * @param {string} paperwork.fechaSolicitud - Fecha de solicitud
 * @param {string} paperwork.tipoTramite - Tipo de trámite
 * @param {string} paperwork.tipoUser - Tipo de usuario
 * @param {string} paperwork.relacionUser - Relación del usuario
 * @param {string} paperwork.registradoComo - Registrado como
 * @param {string} paperwork.registroEmpresa - Registro de empresa
 * @param {string} paperwork.apellidosUser - Apellidos del usuario
 * @param {string} paperwork.nombresUser - Nombres del usuario
 * @param {string} paperwork.username - Username
 * @param {string} paperwork.actualizarEmail - Actualizar email
 * @param {string} paperwork.email - Email
 * @param {string} paperwork.verificadoEmail - Verificado email
 * @param {string} paperwork.telefonocelular - Teléfono celular
 * @param {string} paperwork.verificadocelular - Verificado celular
 * @param {string} paperwork.novedad - Novedad
 * @param {string} paperwork.estadoTramite - Estado del trámite
 * @param {string} paperwork.responsableAprobacion - Responsable de aprobación
 * @param {string} paperwork.fechaAprobacion - Fecha de aprobación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const savePaperwork = async (paperwork) => {
  try {
    const response = await axiosInstance.post(API_BASE, {
      Process: 'putPaperworks',
      RegTramite: paperwork.regTramite,
      FechaSolicitud: paperwork.fechaSolicitud,
      TipoDeTramite: paperwork.tipoTramite,
      TipoUser: paperwork.tipoUser,
      RelacionUser: paperwork.relacionUser,
      RegistradoComo: paperwork.registradoComo,
      RegistroEmpresa: paperwork.registroEmpresa,
      ApellidosUser: paperwork.apellidosUser,
      NombresUser: paperwork.nombresUser,
      Username: paperwork.username,
      ActualizarEmail: paperwork.actualizarEmail,
      Email: paperwork.email,
      VerificadoEmail: paperwork.verificadoEmail,
      TelefonoCelular: paperwork.telefonocelular,
      VerificadoCelular: paperwork.verificadocelular,
      Novedad: paperwork.novedad,
      EstadoTramite: paperwork.estadoTramite,
      ResponsableAprobacion: paperwork.responsableAprobacion,
      FechaAprobacion: paperwork.fechaAprobacion
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un trámite
 * @param {number} id - ID del trámite a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deletePaperwork = async (id) => {
  try {
    const response = await axiosInstance.post(API_BASE, {
      Process: 'deletePaperworks',
      RegTramite: id
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
