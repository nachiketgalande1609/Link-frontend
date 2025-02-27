import axios, { AxiosInstance } from "axios";
import { useGlobalStore } from "../store/store";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const token = localStorage.getItem("token");

const userId = useGlobalStore.getState().user?.id || "";

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Current-User-Id": userId || "", // Attach currentUserId directly
    },
});

export default api;
