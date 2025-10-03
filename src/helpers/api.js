import axios from 'axios';
import Cookies from 'js-cookie';
import { ENDPOINTS } from './endPoints';

const api = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get('company-auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      Cookies.remove('company-auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


