import axiosInstance from '../../config/axios';
const API_BASE = '/api/Bitacora/Process';

export const getBitacora = async (params = {}) => {
  const requestParams = {
    process: 'getBitacora',
    ...params
  };
  const response = await axiosInstance.post(API_BASE, requestParams);
  return response.data;
};

export const putBitacora = async (bitacora) => {
  const requestParams = {
    process: 'putBitacora',
    ...bitacora
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
