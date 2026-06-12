import axios from 'axios';

const api = axios.create({
  // Asegúrate de incluir el https://
  baseURL: 'https://mvp-backend-production-0f36.up.railway.app', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atleta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;