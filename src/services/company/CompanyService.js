import axiosInstance from '../../config/axios';
const API_BASE = '/api';

/**
 * Obtiene la lista de empresas con soporte para paginación
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page=1] - Número de página
 * @param {number} [params.pageSize=100] - Cantidad de registros por página
 * @param {string} [params.codeCompany] - Código de la empresa
 * @param {number} [params.codeGroup] - Código del grupo (opcional)
 * @param {string} [params.nameGroup] - Nombre del grupo (opcional)
 * @param {string} [params.searchTerm] - Término de búsqueda para filtrar por RUC o nombre de empresa
 * @param {boolean} [params.getAll=false] - Si es true, obtiene todas las páginas disponibles
 */
export const getEmpresas = async (params = {}) => {
  try {
  
    const { getAll = false, pageSize = 100, ...restParams } = params;
    let currentPage = getAll ? 1 : (params.page || 1);
    let allCompanies = [];
    let hasMorePages = true;
    let totalPages = 1;

    // Asegurarnos de que process esté incluido
    const processName = params.process || 'getCompanies';

    // If getAll is true, fetch all pages
    if (getAll) {
      currentPage = 1;
    } else {
      // If not fetching all, just fetch the requested page
      const requestParams = {
        process: processName,
        page: currentPage,
        pageSize,
        ...restParams
      };
      console.log('getEmpresas - Enviando solicitud única:', requestParams);
      const response = await axiosInstance.post(`${API_BASE}/companies/process`, requestParams);
      console.log('getEmpresas - Respuesta recibida:', response.data);

      // Handle response
      let companies = [];
      if (Array.isArray(response.data)) {
        companies = response.data;
      } else if (response.data?.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
        totalPages = response.data.totalPages || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        companies = response.data.data;
        totalPages = response.data.last_page || 1;
      }

      return {
        companies,
        totalRecords: companies.length,
        totalPages,
        currentPage,
        pageSize
      };
    }

    do {
      // Asegurarnos de que params sea un objeto
      const requestParams = {
        process: processName,
        page: currentPage,
        pageSize,
        ...restParams
      };

      console.log(`getEmpresas - Enviando solicitud para página ${currentPage}:`, requestParams);
      
      // Realizar la petición
      const response = await axiosInstance.post(`${API_BASE}/companies/process`, requestParams);
      console.log(`getEmpresas - Respuesta recibida para página ${currentPage}:`, response.data);
      
      // Manejar la respuesta según la estructura esperada
      let companies = [];
      if (Array.isArray(response.data)) {
        companies = response.data;
      } else if (response.data?.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
        totalPages = response.data.totalPages || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        companies = response.data.data;
        totalPages = response.data.last_page || 1;
      }
      
      // Agregar empresas al arreglo acumulativo
      allCompanies = [...allCompanies, ...companies];
      
      // Verificar si hay más páginas por cargar
      hasMorePages = getAll && (currentPage < totalPages) && companies.length > 0;
      currentPage++;
      
      // Pequeña pausa para no saturar el servidor
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (hasMorePages);
    
    return {
      companies: allCompanies,
      totalRecords: allCompanies.length,
      totalPages,
      currentPage: getAll ? totalPages : currentPage,
      pageSize
    };
  } catch (error) {
    console.error('Error en getEmpresas:', error);
    console.error('Detalles del error:', error.response?.data || error.message);
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
 * @param {boolean} [empresa.state] - ¿Está activa?
 */
export const putEmpresa = async (empresa) => {
  const response = await axiosInstance.post(API_BASE + '/companies/process', {
    process: 'putCompanies',
    ...empresa
  });
  console.log(response.data);
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