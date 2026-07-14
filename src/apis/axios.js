import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isDeveloper = url.includes('/developer') || url.includes('developer-portal');

    // Dynamically set baseURL if relative path
    if (!/^https?:\/\//i.test(url)) {
      if (isDeveloper) {
        config.baseURL = import.meta.env.VITE_DEVELOPER_API_URL;
      } else {
        config.baseURL = import.meta.env.VITE_ADMIN_API_URL;
      }
    }

    // Dynamically attach authorization tokens
    if (!config.headers.Authorization) {
      if (isDeveloper) {
        const devToken = localStorage.getItem('developerAuthToken');
        if (devToken) {
          config.headers.Authorization = `Bearer ${devToken}`;
        }
      } else {
        const adminToken = localStorage.getItem('authToken');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
