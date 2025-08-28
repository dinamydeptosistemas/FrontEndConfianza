// services/config/ConfigService.js
import axiosInstance from '../../config/axios';
const API_BASE = '/api';

/**
 * Uploads a logo file to the server
 * @param {File} file - The logo file to upload
 * @returns {Promise<Object>} - Response containing the file path
 */
export const uploadLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post(`${API_BASE}/config/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};

/**
 * Gets the current configuration
 * @returns {Promise<Object>} - Current configuration data
 */
export const getConfig = async () => {
  try {
    // Use POST request with process parameter instead of GET
    const requestBody = { process: 'getConfig' };
    const response = await axiosInstance.post(`${API_BASE}/config/ProcessConfig`, requestBody);
    return response.data;
  } catch (error) {
    console.error('Error getting config:', error);
    throw error;
  }
};

/**
 * Saves the configuration
 * @param {Object} configData - Configuration data to save
 * @returns {Promise<Object>} - Response from the server
 */
export const saveConfig = async (configData, Process = 'putConfig') => {
  try {
    // Include the process field in the request body
    const requestBody = { Process, ...configData };
    const response = await axiosInstance.post(`${API_BASE}/config/ProcessConfig`, requestBody);
    console.log('Configuration saved successfully:', response.data);
    return response.data;
  
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
};