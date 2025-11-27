// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

// İstek gönderilmeden hemen önce çalışan interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;