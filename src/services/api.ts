import api from "./config";
import { REGISTER_ENDPOINT, LOGIN_ENDPOINT, POSTS_ENDPOINT, GET_PROFILE_ENDPOINT } from "./apiEndpoints";

interface UserRegisterData {
    email: string;
    username: string;
    password: string;
}

interface UserLoginData {
    email: string;
    password: string;
}

interface PostData {
    user_id: string;
    content: string;
    image_url: string;
    video_url: string;
    location: string;
    tags: string;
}

export const registerUser = async (userData: UserRegisterData) => {
    try {
        const response = await api.post(REGISTER_ENDPOINT, userData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Registration failed:", error.message);
        } else {
            console.error("Registration failed: Unknown error");
        }
        throw error;
    }
};

export const loginUser = async (userData: UserLoginData) => {
    try {
        const response = await api.post(LOGIN_ENDPOINT, userData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Login failed:", error.message);
        } else {
            console.error("Login failed: Unknown error");
        }
        throw error;
    }
};

export const getPosts = async () => {
    try {
        const response = await api.get(POSTS_ENDPOINT);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("unknown Error");
        }
        throw error;
    }
};

export const getProfile = async (userId: string) => {
    try {
        const response = await api.get(`${GET_PROFILE_ENDPOINT}/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const createPost = async (postData: PostData) => {
    try {
        const response = await api.post(POSTS_ENDPOINT, postData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("unknown Error");
        }
        throw error;
    }
};
