import axios from "axios";
import { useGlobalStore } from "../store/store";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔁 Add dynamic headers using a request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const userId = useGlobalStore.getState().user?.id || "";

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    config.headers["X-CURRENT-USER-ID"] = userId;

    return config;
});

export default api;
