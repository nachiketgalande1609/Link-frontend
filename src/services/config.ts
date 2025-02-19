import axios, { AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const token = localStorage.getItem("token");

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
});

export default api;
