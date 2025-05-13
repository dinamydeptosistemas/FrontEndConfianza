import axiosInstance from '../../config/axios';
const API_BASE = '/api';

/**
 * Obtiene la lista de empresas
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page] - Número de página
 * @param {string} [params.codeCompany] - Código de la empresa
 * @param {number} [params.codeGroup] - Código del grupo (opcional)
 * @param {string} [params.nameGroup] - Nombre del grupo (opcional)
 * @param {string} [params.searchTerm] - Término de búsqueda para filtrar por RUC o nombre de empresa
 */
export const getEmpresas = async (params = {}) => {
  try {
    // Asegurarnos de que params sea un objeto
    const requestParams = {
      process: 'getCompanies',
      ...params
    };

    // Log de la petición
    console.log('Enviando petición a /companies/process con:', requestParams);

    // Realizar la petición
    const response = await axiosInstance.post(`${API_BASE}/companies/process`, requestParams);
    
    // Log de la respuesta
    console.log('Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error en getEmpresas:', error);
    if (error.response) {
      console.error('Detalles del error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};

/**
 * Crea o actualiza una empresa
 * @param {Object} empresa - Datos de la empresa
 * @param {string} [empresa.codeCompany] - Código de la empresa (requerido para actualización)
 * @param {string} empresa.businessName - Razón social (requerido para creación)
 * @param {number} empresa.codeGroup - Código del grupo (requerido para creación)
 * @param {string} [empresa.nameGroup] - Nombre del grupo
 * @param {string} [empresa.ruc] - RUC de la empresa
 * @param {string} [empresa.typeEntity] - Tipo de entidad
 * @param {boolean} [empresa.matrix] - ¿Es matriz?
 * @param {string} [empresa.commercialName] - Nombre comercial
 * @param {string} [empresa.address] - Dirección
 * @param {string} [empresa.city] - Ciudad
 * @param {string} [empresa.province] - Provincia
 * @param {string} [empresa.phone] - Teléfono
 * @param {string} [empresa.email] - Email
 * @param {string} [empresa.economicActivity] - Actividad económica
 * @param {string} [empresa.salesReceipt] - Comprobante de venta
 * @param {string} [empresa.taxRegime] - Régimen tributario
 * @param {string} [empresa.regimeLegend] - Leyenda de régimen
 * @param {boolean} [empresa.keepsAccounting] - ¿Lleva contabilidad?
 * @param {boolean} [empresa.retentionAgent] - ¿Es agente de retención?
 * @param {string} [empresa.logoImagePath] - Ruta de la imagen del logo
 */
export const putEmpresa = async (empresa) => {
  const response = await axiosInstance.post(API_BASE + '/companies/process', {
    process: 'putCompanies',
    ...empresa
  });
  return response.data;
};

/**
 * Elimina una empresa
 * @param {string} codeCompany - Código de la empresa a eliminar
 */
export const deleteEmpresa = async (codeCompany) => {
  const response = await axiosInstance.post(API_BASE + '/companies/process', {
    process: 'deleteCompanies',
    codeCompany
  });
  return response.data;
}; 