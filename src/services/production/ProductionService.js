import axiosInstance from '../../config/axios';

const API_BASE = '/api/Production';

/**
 * Moves test data to the production environment.
 * @returns {Promise<Object>} The result of the operation.
 */
export const moveToProduction = async () => {
    try {
        const response = await axiosInstance.post(`${API_BASE}/CambiarAProduccion`);
        return response.data;
    } catch (error) {
        console.error('Error in moveToProduction:', error);
        throw error;
    }
};
