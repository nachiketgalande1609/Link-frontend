import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://localhost:5000";

const token = localStorage.getItem("token");


const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
});

export default api;
