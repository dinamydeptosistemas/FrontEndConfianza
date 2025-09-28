import axiosInstance from '../../config/axios';
const API_BASE = '/api/Bitacora/Process';

export const getBitacora = async (params = {}) => {
  console.log('[BitacoraService] Filtros recibidos:', params);
  // Solo enviar filtros válidos y no vacíos
  const filtrosValidos = {};
  const estadosPermitidos = ["0", "1", "2", "Activo", "Cerrado", "Bloqueado"];
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(key === 'estadoSesion' && !estadosPermitidos.includes(value))
    ) {
      filtrosValidos[key] = value;
    }
  });
  const requestParams = {
    process: 'getBitacora',
    ...filtrosValidos
  };
  console.log('[BitacoraService] Filtros enviados al backend:', requestParams);
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};

/**
 * Actualiza una bitácora para bloquear una sesión
 * El procedimiento almacenado actualizado solo permite bloquear sesiones (estado '2')
 * No se requiere el parámetro estadoSesion ya que el SP siempre establece el estado a bloqueado
 * @param {Object} bitacora - Objeto con el regAcceso de la bitácora a actualizar
 * @returns {Promise} - Respuesta del servidor
 */
export const putBitacora = async (bitacora) => {
  if (!bitacora.regAcceso) {
    throw new Error('El campo regAcceso es requerido para bloquear una sesión');
  }
  const requestParams = {
    process: 'putBitacora',
    regAcceso: bitacora.regAcceso
    // No se envía estadoSesion ya que el SP siempre establece el estado a bloqueado
  };
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};

export const deleteBitacora = async (fechaInicioEliminar, fechaFinEliminar) => {
  const requestParams = {
    process: 'deleteBitacora',
    fechaInicioEliminar,
    fechaFinEliminar
  };
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};
