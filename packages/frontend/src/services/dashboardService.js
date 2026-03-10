import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getHomeData = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/home`, { params: { userId } });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da home:", error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
};
