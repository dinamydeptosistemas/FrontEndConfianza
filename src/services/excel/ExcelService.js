import axiosInstance from '../../config/axios';

/**
 * Servicio para generar archivos Excel a partir de respuestas de API
 * Este servicio puede ser utilizado desde cualquier componente (usuarios, empresas, perfiles, etc.)
 */

const API_BASE = '/api';

/**
 * Genera un archivo Excel a partir de datos proporcionados
 * @param {Array} data - Datos a exportar
 * @param {Object} columnMappings - Mapeo de propiedades a nombres de columnas
 * @param {string} worksheetName - Nombre de la hoja de Excel
 * @param {string} fileName - Nombre del archivo a descargar
 * @returns {Promise<Blob>} Blob del archivo Excel generado
 */
export const generateExcel = async (data, columnMappings, worksheetName = 'Datos', fileName = 'datos') => {
    try {
        const response = await axiosInstance.post(`${API_BASE}/generateFiles/generar-excel`, {
            data,
            columnMappings,
            worksheetName,
            fileName
        }, {
            responseType: 'blob' // Importante para recibir el archivo como blob
        });
        
        return response.data;
    } catch (error) {
        console.error('Error al generar Excel:', error);
        throw error;
    }
};

/**
 * Descarga un archivo Excel generado a partir de datos de API
 * @param {Array} data - Datos a exportar
 * @param {Object} columnMappings - Mapeo de propiedades a nombres de columnas
 * @param {string} worksheetName - Nombre de la hoja de Excel
 * @param {string} fileName - Nombre del archivo a descargar
 */
export const downloadExcel = async (data, columnMappings, worksheetName = 'Datos', fileName = 'datos') => {
    try {
        const excelBlob = await generateExcel(data, columnMappings, worksheetName, fileName);
        
        // Crear URL para el blob
        const url = window.URL.createObjectURL(excelBlob);
        
        // Crear elemento <a> para descargar
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.xlsx`);
        
        // Añadir al DOM, hacer clic y eliminar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar Excel:', error);
        throw error;
    }
};

/**
 * Genera y descarga un Excel directamente desde una llamada a API
 * @param {string} endpoint - Endpoint de la API para obtener los datos
 * @param {Object} params - Parámetros para la llamada a la API
 * @param {Object} columnMappings - Mapeo de propiedades a nombres de columnas
 * @param {string} worksheetName - Nombre de la hoja de Excel
 * @param {string} fileName - Nombre del archivo a descargar
 */
export const generateExcelFromApi = async (endpoint, params = {}, columnMappings, worksheetName = 'Datos', fileName = 'datos') => {
    try {
        // Obtener datos de la API
        const response = await axiosInstance.post(endpoint, params);
        
        // Verificar si la respuesta tiene datos
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
            throw new Error('No hay datos disponibles para exportar');
        }
        
        // Extraer los datos correctos según la estructura de la respuesta
        let dataToExport;
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response.data)) {
            dataToExport = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            dataToExport = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
            dataToExport = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
            dataToExport = response.data.results;
        } else {
            // Si no podemos identificar la estructura, usamos la respuesta completa
            dataToExport = [response.data];
        }
        
        // Generar y descargar el Excel
        await downloadExcel(dataToExport, columnMappings, worksheetName, fileName);
        
        return true;
    } catch (error) {
        console.error('Error al generar Excel desde API:', error);
        throw error;
    }
};

/**
 * Genera y descarga un Excel de usuarios
 * @param {Object} params - Parámetros de búsqueda para usuarios
 */
export const generateUsersExcel = async (params = {}) => {
    const columnMappings = {
        'idUser': 'ID',
        'nombreUser': 'Nombre',
        'apellidosUser': 'Apellidos',
        'username': 'Usuario',
        'emailUsuario': 'Correo',
        'celularUsuario': 'Teléfono',
        'tipoUser': 'Tipo',
        'relacionUsuario': 'Relación',
        'usuarioActivo': 'Estado',
        'fechaRegistro': 'Fecha Registro'
    };
    
    return generateExcelFromApi(
        `${API_BASE}/user/process`, 
        { process: 'getUsers', ...params }, 
        columnMappings, 
        'Usuarios', 
        'usuarios'
    );
};

/**
 * Genera y descarga un Excel de empresas
 * @param {Object} params - Parámetros de búsqueda para empresas
 */
export const generateCompaniesExcel = async (params = {}) => {
    const columnMappings = {
        'idCompany': 'ID',
        'nameCompany': 'Nombre',
        'rucCompany': 'RUC',
        'addressCompany': 'Dirección',
        'phoneCompany': 'Teléfono',
        'emailCompany': 'Correo',
        'statusCompany': 'Estado',
        'creationDate': 'Fecha Creación'
    };
    
    return generateExcelFromApi(
        `${API_BASE}/company/process`, 
        { process: 'getCompanies', ...params }, 
        columnMappings, 
        'Empresas', 
        'empresas'
    );
};

/**
 * Genera y descarga un Excel de perfiles
 * @param {Object} params - Parámetros de búsqueda para perfiles
 */
export const generateProfilesExcel = async (params = {}) => {
    const columnMappings = {
        'idProfile': 'ID',
        'nameProfile': 'Nombre',
        'descriptionProfile': 'Descripción',
        'statusProfile': 'Estado',
        'creationDate': 'Fecha Creación'
    };
    
    return generateExcelFromApi(
        `${API_BASE}/accessProfile/process`, 
        { process: 'getProfiles', ...params }, 
        columnMappings, 
        'Perfiles', 
        'perfiles'
    );
};

/**
 * Función genérica para generar Excel desde cualquier endpoint
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros para la API
 * @param {Object} columnMappings - Mapeo de columnas
 * @param {string} worksheetName - Nombre de la hoja
 * @param {string} fileName - Nombre del archivo
 */
export const generateCustomExcel = async (endpoint, params = {}, columnMappings, worksheetName = 'Datos', fileName = 'datos') => {
    return generateExcelFromApi(endpoint, params, columnMappings, worksheetName, fileName);
};

// Crear el objeto de servicio antes de exportarlo para evitar la advertencia de ESLint
const ExcelService = {
    generateExcel,
    downloadExcel,
    generateExcelFromApi,
    generateUsersExcel,
    generateCompaniesExcel,
    generateProfilesExcel,
    generateCustomExcel
};

export default ExcelService;
