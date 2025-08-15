import axiosInstance from '../../config/axios';

const API_BASE = '/api/DataCleanup';

/**
 * Counts the number of records in the 'PRUEBAS' environment.
 * @returns {Promise<Object>} The count of test data.
 */
export const countTestData = async () => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/count-test-data`);
        return response.data;
    } catch (error) {
        console.error('Error in countTestData:', error);
        throw error;
    }
};

/**
 * Executes the data cleanup process for the 'PRUEBAS' environment.
 * @returns {Promise<Object>} The result of the cleanup process.
 */
export const cleanTestData = async () => {
    try {
        const response = await axiosInstance.post(`${API_BASE}/clean-test-data`);
        return response.data;
    } catch (error) {
        console.error('Error in cleanTestData:', error);
        throw error;
    }
};
