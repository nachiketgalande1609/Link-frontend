import axios from "axios";
import { useGlobalStore } from "../store/store";

const VITE_MESSAGES_MICROSERVICE_URL = import.meta.env.VITE_MESSAGES_MICROSERVICE_URL;

const messagesApi = axios.create({
    baseURL: VITE_MESSAGES_MICROSERVICE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

messagesApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const userId = useGlobalStore.getState().user?.id || "";

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    config.headers["X-CURRENT-USER-ID"] = userId;

    return config;
});

export default messagesApi;
