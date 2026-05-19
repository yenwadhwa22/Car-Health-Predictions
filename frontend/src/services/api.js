import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:8000';
const RENDER_API_URL = 'https://car-health-predictions-3.onrender.com';

/**
 * Vite loads the right URL per command:
 * - npm run dev     → .env.development → localhost:8000
 * - npm run build   → .env.production  → Render
 * Supabase keys stay in .env (shared across modes).
 */
function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return import.meta.env.DEV ? LOCAL_API_URL : RENDER_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

if (import.meta.env.DEV) {
  console.info('[DriveSense] API:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
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
      const errMsg =
        error.response?.data?.detail || error.message || 'Unknown error occurred';
      return { data: null, error: errMsg };
    }
  },
};
