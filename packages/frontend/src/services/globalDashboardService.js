import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getGlobalMetrics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/global-dashboard`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar métricas globais:", error);
    throw error;
  }
};
