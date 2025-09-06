import axiosInstance from '../../config/axios';
const API_BASE = '/api';

/**
 * Obtiene la lista de empresas con soporte para paginación
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} [params.page=1] - Número de página
 * @param {number} [params.pageSize=10] - Cantidad de registros por página
 * @param {string} [params.codeCompany] - Código de la empresa
 * @param {string} [params.ruc] - RUC de la empresa
 * @param {string} [params.businessName] - Razón social para filtrar
 * @param {string} [params.commercialName] - Nombre comercial para filtrar
 * @param {number} [params.codeGroup] - Código del grupo (opcional)
 * @param {string} [params.searchTerm] - Término de búsqueda para filtrar por RUC o nombre de empresa
 * @param {boolean} [params.getAll=false] - Si es true, obtiene todas las páginas disponibles
 */
export const getEmpresas = async (params = {}) => {
  try {
    const { getAll = false, pageSize = 10, searchTerm, ...restParams } = params;
    let currentPage = getAll ? 1 : (params.page || 1);
    let allCompanies = [];
    let hasMorePages = true;
    let totalPages = 1;
    let totalRecords = 0;

    // Asegurarnos de que process esté incluido
    const processName = 'getCompanies';

    // Preparar parámetros para el backend
    const apiParams = {};
    
    // Convertir nombres de parámetros a PascalCase para el backend
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertir primera letra a mayúscula
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        apiParams[pascalKey] = value;
      }
    });
    
    // Agregar parámetros estándar
    apiParams.Process = processName;
    apiParams.Page = currentPage;
    
    // Manejar searchTerm si existe
    if (searchTerm) {
      // Intentar determinar si es un RUC o un nombre
      if (/^\d+$/.test(searchTerm)) {
        apiParams.RUC = searchTerm;
      } else {
        apiParams.BusinessName = searchTerm;
      }
    }

    // If getAll is true, fetch all pages
    if (getAll) {
      currentPage = 1;
    } else {
      // If not fetching all, just fetch the requested page
      console.log('getEmpresas - Enviando solicitud única:', apiParams);
      const response = await axiosInstance.post(`${API_BASE}/Companies/Process`, apiParams);
      console.log('getEmpresas - Respuesta recibida:', response.data);

      // Handle response
      let companies = [];
      if (Array.isArray(response.data)) {
        companies = response.data;
      } else if (response.data?.Companies && Array.isArray(response.data.Companies)) {
        companies = response.data.Companies;
        totalPages = response.data.TotalPages || 1;
        totalRecords = response.data.TotalRecords || 0;
      } else if (response.data?.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
        totalPages = response.data.totalPages || 1;
        totalRecords = response.data.totalRecords || 0;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        companies = response.data.data;
        totalPages = response.data.last_page || 1;
        totalRecords = response.data.total || 0;
      }

      return {
        companies,
        totalRecords: totalRecords || companies.length,
        totalPages,
        currentPage,
        pageSize
      };
    }

    do {
      // Actualizar el número de página en los parámetros
      apiParams.Page = currentPage;

      console.log(`getEmpresas - Enviando solicitud para página ${currentPage}:`, apiParams);
      
      // Realizar la petición
      const response = await axiosInstance.post(`${API_BASE}/Companies/Process`, apiParams);
      console.log(`getEmpresas - Respuesta recibida para página ${currentPage}:`, response.data);
      
      // Manejar la respuesta según la estructura esperada
      let companies = [];
      if (Array.isArray(response.data)) {
        companies = response.data;
      } else if (response.data?.Companies && Array.isArray(response.data.Companies)) {
        companies = response.data.Companies;
        totalPages = response.data.TotalPages || 1;
        if (currentPage === 1) totalRecords = response.data.TotalRecords || 0;
      } else if (response.data?.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
        totalPages = response.data.totalPages || 1;
        if (currentPage === 1) totalRecords = response.data.totalRecords || 0;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        companies = response.data.data;
        totalPages = response.data.last_page || 1;
        if (currentPage === 1) totalRecords = response.data.total || 0;
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
      totalRecords: totalRecords || allCompanies.length,
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
 * @param {string} [empresa.Enviroment] - Ambiente del sistema
 */
export const putEmpresa = async (empresa) => {
  // Convertir nombres de propiedades a PascalCase como espera el backend
  const empresaDTO = {
    Process: 'putCompanies'
  };
  
  // Verificar que empresa no sea null o undefined
  if (empresa && typeof empresa === 'object') {
    // Convertir cada propiedad a PascalCase
    Object.entries(empresa).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convertir primera letra a mayúscula
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        
        // Asegurarse de que los valores booleanos se envíen correctamente
        if (typeof value === 'boolean') {
          // Para valores booleanos, enviar true o false (no como strings)
          empresaDTO[pascalKey] = value;
        } else if (key === 'retentionAgent' || key === 'matrix' || key === 'keepsAccounting' || key === 'state') {
          // Para campos que deben ser booleanos, asegurar que se envíen como booleanos
          if (value === 'true' || value === '1' || value === 1) {
            empresaDTO[pascalKey] = true;
          } else if (value === 'false' || value === '0' || value === 0) {
            empresaDTO[pascalKey] = false;
          } else {
            // Si no es un valor reconocible como booleano, usar false por defecto
            empresaDTO[pascalKey] = false;
          }
        } else {
          // Para otros tipos de valores
          empresaDTO[pascalKey] = value;
        }
      }
    });
  } else {
    console.error('Error: El objeto empresa es null o undefined');
    throw new Error('El objeto empresa es inválido');
  }
  console.log('Enviando datos de empresa:', empresaDTO);
  try {
    const response = await axiosInstance.post(`${API_BASE}/Companies/Process`, empresaDTO);
    console.log('Respuesta de actualización:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error detallado en putEmpresa:', {
      mensaje: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Mostrar errores de validación específicos si existen
    if (error.response?.data?.errors) {
      console.error('Errores de validación detallados:');
      Object.entries(error.response.data.errors).forEach(([campo, mensajes]) => {
        console.error(`Campo '${campo}':`, mensajes);
      });
    }
    throw error;
  }
};

/**
 * Elimina una empresa
 * @param {string} codeCompany - Código de la empresa a eliminar
 */
export const deleteEmpresa = async (codeCompany) => {
  const response = await axiosInstance.post(`${API_BASE}/Companies/Process`, {
    Process: 'deleteCompanies',
    CodeCompany: codeCompany
  });
  return response.data;
};

/**
 * Descarga una plantilla de empresas en formato Excel
 * @param {Object} filters - Filtros para la descarga
 * @param {string} [filters.process] - Proceso ('getCompanies')
 * @param {number} [filters.page=0] - Página (0 para plantilla vacía, 1 para exportar todas)
 * @param {string} [filters.codeCompany] - Filtrar por código de empresa
 * @param {string} [filters.ruc] - Filtrar por RUC
 * @param {string} [filters.businessName] - Filtrar por razón social
 * @param {string} [filters.commercialName] - Filtrar por nombre comercial
 * @param {number} [filters.codeGroup] - Filtrar por código de grupo
 * @returns {Promise<Blob>} Archivo de Excel
 */
export const downloadTemplate = async (filters = {}) => {
  try {
    console.log('Solicitando plantilla de empresas con filtros:', filters);
    
    // Asegurar que los nombres de parámetros estén en PascalCase como espera el backend
    const formattedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertir primera letra a mayúscula
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        formattedFilters[pascalKey] = value;
      }
    });
    
    // Asegurar que Process esté definido
    if (!formattedFilters.Process) {
      formattedFilters.Process = 'getCompanies';
    }
    
    console.log('Filtros formateados:', formattedFilters);
    
    const response = await axiosInstance.post('api/Companies/Export', formattedFilters, {
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
 * Sube un archivo de plantilla para importar empresas
 * @param {FormData} formData - Datos del formulario que incluye el archivo (Archivo) y si es actualización (EsActualizacion)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadTemplate = async (formData) => {
  try {
    console.log('Enviando archivo al servidor...');
    
    // Verificar que el FormData tenga los campos correctos según espera el backend
    if (!formData.has('Archivo')) {
      console.warn('El FormData no contiene el campo "Archivo" que espera el backend');
    }
    
    // Mostrar contenido del FormData para depuración
    for (let [key, value] of formData.entries()) {
      console.log(`FormData contiene: ${key} = ${value instanceof File ? value.name : value}`);
    }
    
    const response = await axiosInstance.post('api/Companies/Import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json, text/plain',
        'X-Requested-With': 'XMLHttpRequest' // Evita redirecciones
      },
      responseType: 'blob' // Permitir respuestas de tipo blob para manejar archivos de errores
    });

    console.log('Respuesta recibida:', {
      status: response.status,
      headers: response.headers,
      contentType: response.headers['content-type']
    });

    // Verificar el tipo de contenido de la respuesta
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      // Es una respuesta JSON
      return response.data;
    } else if (contentType && contentType.includes('text/plain')) {
      // Es un archivo de texto con errores
      const text = await response.data.text();
      return { 
        success: false, 
        message: 'Se encontraron errores en la importación', 
        errors: text.split('\r\n')
      };
    } else if (response.data instanceof Blob) {
      // Es un archivo de errores
      const text = await response.data.text();
      try {
        // Intentar parsear como JSON
        return JSON.parse(text);
      } catch (e) {
        // Si no es JSON, devolver como texto
        return { 
          success: false, 
          message: 'Se encontraron errores en la importación', 
          errors: text.split('\r\n')
        };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al subir plantilla:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          'Error al procesar el archivo';
      throw new Error(errorMessage);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Error al configurar la solicitud
      throw error;
    }
  }
};