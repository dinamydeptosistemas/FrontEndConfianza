import axios from 'axios';
import axiosInstance from '../../config/axios';

// API Configuration using environment variables
const API_BASE = process.env.REACT_APP_API_BASE_URL ? 
  `${process.env.REACT_APP_API_BASE_URL}/api/SocialMedia/Process` : 
  '/api/SocialMedia/Process';

const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10);

// Common configuration for all requests
const commonConfig = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Application-Name': 'frontend-confianza',
    'X-Environment': process.env.NODE_ENV || 'development',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
};

/**
 * Handles API requests with consistent error handling
 * @param {Function} requestFn - The axios request function to execute
 * @returns {Promise<Object>} - The response data
 * @throws {Error} - If the request fails
 */
const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    if (!response?.data) {
      throw new Error('No se recibieron datos en la respuesta del servidor');
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      if (status === 401) {
        window.location.href = '/login';
      }
      
      throw new Error(errorMessage || 'Error en la petición');
    }
    
    throw error;
  }
};

/**
 * Fetches social media accounts with optional filtering
 * @param {Object} params - Filter parameters
 * @param {number} [params.page=1] - Page number
 * @param {string} [params.filterRedSocial] - Filter by social media platform
 * @returns {Promise<Object>} - List of social media accounts
 */
const getSocialMedia = async (params = {}) => {
  return handleRequest(() => 
    axiosInstance.post(API_BASE, {
      process: 'getSocialmedia',
      page: 1,
      ...params
    }, commonConfig)
  );
};

/**
 * Creates or updates a social media account
 * @param {Object} socialMedia - Social media account data
 * @param {string} socialMedia.tipoMedio - Type of media
 * @param {boolean} socialMedia.medioActivo - Whether the media is active
 * @param {string} socialMedia.redSocial - Social media platform
 * @param {string} socialMedia.nombreCuenta - Account name (required for new records)
 * @param {string} [socialMedia.password] - Password (only for updates, leave empty to keep current)
 * @param {string} socialMedia.codEntidad - Entity code
 * @param {string} socialMedia.empresa - Company name
 * @param {string} socialMedia.responsable - Responsible person
 * @param {string} socialMedia.departamento - Department
 * @param {string} socialMedia.tipoProceso - Process type (e.g., 'EXTERNO')
 * @param {string} socialMedia.notaDeUso - Usage notes
 * @param {number} [socialMedia.idMedio] - Media ID (for updates)
 * @returns {Promise<Object>} - Server response
 */
const saveSocialMedia = async (socialMedia) => {
  // Don't send password if it's empty (to keep current password)
  const { password, ...rest } = socialMedia;
  const payload = {
    process: 'putSocialmedia',
    ...rest,
    ...(password ? { password } : {}) // Only include password if provided
  };

  return handleRequest(() => 
    axiosInstance.post(API_BASE, payload, commonConfig)
  );
};

/**
 * Deletes a social media account
 * @param {number} idMedio - ID of the media to delete
 * @returns {Promise<Object>} - Server response
 */
const deleteSocialMedia = async (idMedio) => {
  if (!idMedio || idMedio <= 0) {
    throw new Error('ID de medio no válido');
  }

  return handleRequest(() =>
    axiosInstance.post(API_BASE, {
      process: 'deleteSocialmedia',
      idMedio
    }, commonConfig)
  );
};

// Export individual functions
export {
  getSocialMedia,
  saveSocialMedia,
  deleteSocialMedia
};

// Also export as default object for backward compatibility
const socialMediaService = {
  getSocialMedia,
  saveSocialMedia,
  deleteSocialMedia
};

export default socialMediaService;
