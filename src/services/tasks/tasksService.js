import axiosInstance from '../../config/axios';

const API_URL = '/api/Task/Process'; // URL base para el servicio de tareas

export const getTasks = async (page) => {
  try {
    const response = await axiosInstance.get(API_URL, {
      params: {
        process: 'getTasks',
        page: page,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Application-Name': 'frontend-confianza',
        'X-Environment': process.env.NODE_ENV || 'development',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    throw error;
  }
};

export const putTask = async (taskData) => {
  try {
    const response = await axiosInstance.post(API_URL, taskData,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Application-Name': 'frontend-confianza',
        'X-Environment': process.env.NODE_ENV || 'development',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear tarea:", error.response ? error.response.data : error.message);
    throw error;
  }
};
