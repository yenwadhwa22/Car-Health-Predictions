import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
  
  getModelInfo: async () => {
    try {
      const response = await apiClient.get('/model-info');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  predict: async (data) => {
    try {
      const response = await apiClient.post('/predict', data);
      return { data: response.data, error: null };
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      return { data: null, error: errMsg };
    }
  }
};
