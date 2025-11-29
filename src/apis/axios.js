import axios from 'axios';

let URL;
if (process.env.NODE_ENV === 'development') {
} else {
  URL = process.env.VITE_BASE_URL;
}
URL = 'https://api.kaacib.com';

const getAuthToken = () => {
  const userData = JSON.parse(localStorage.getItem('user___token'));
  return userData?.token || null;
};

const removeAuthToken = () => {
  localStorage.removeItem('user___token');
};

const axiosInstance = axios.create({
  baseURL: URL + '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getAuthToken();
    if (token && config.isToken !== false) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 405) {
      removeAuthToken();
      console.error('Session expired. Please log in again.');
    } else if (
      error.response?.status === 401 &&
      originalRequest.isToken !== false &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = getAuthToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Session expired. Please log in again.', 'error');
        throw err;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
