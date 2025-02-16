import axios, { AxiosInstance } from "axios";

// const BASE_URL = "http://192.168.31.142:5000";
const BASE_URL = "http://192.168.1.10:5000";

const token = localStorage.getItem("token");

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
});

export default api;
