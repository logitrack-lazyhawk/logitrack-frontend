import axios from 'axios';
import { cerrarSesion } from '../auth/session';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL || '',
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) cerrarSesion();
    return Promise.reject(error);
});

export default axiosClient;
