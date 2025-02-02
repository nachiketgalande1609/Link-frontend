import api from "./config";
import {
    REGISTER_ENDPOINT,
    LOGIN_ENDPOINT,
    POSTS_ENDPOINT,
    GET_PROFILE_ENDPOINT,
    LIKE_POST_ENDPOINT,
    ADD_POST_COMMENT_ENDPOINT,
    FOLLOW_ENDPOINT,
    SEARCH_ENDPOINT,
    CHAT_USER_DETAILS_ENDPOINT,
    GET_NOTIFICATIONS_ENDPOINT,
    UPDATE_POST_ENDPOINT,
    GOOGLE_LOGIN_ENDPOINT,
    GET_NOTIFICATIONS_COUNT,
} from "./apiEndpoints";

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

// User APIs

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

export const googleLogin = async (data: { token: string }) => {
    try {
        const response = await api.post(`${GOOGLE_LOGIN_ENDPOINT}`, data);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Google login failed:", error.message);
        } else {
            console.error("Google login failed: Unknown error");
        }
        throw error;
    }
};
// Post APIs

export const getPosts = async (userId: string) => {
    try {
        const response = await api.get(`${POSTS_ENDPOINT}?userId=${userId}`);

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

export const getProfile = async (userId: string, currentUserId: string) => {
    console.log(`${GET_PROFILE_ENDPOINT}/${userId}?currentUserId=${currentUserId}`);

    try {
        const response = await api.get(`${GET_PROFILE_ENDPOINT}/${userId}?currentUserId=${currentUserId}`);
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

export const getUserPosts = async (userId: string) => {
    try {
        const response = await api.get(`${POSTS_ENDPOINT}/${userId}`);
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

export const updatePost = async (postId: string, editContent: string) => {
    try {
        const response = await api.post(`${UPDATE_POST_ENDPOINT}/${postId}`, { content: editContent });
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

export const deletePost = async (userId: string, postId: string) => {
    try {
        const response = await api.delete(`${POSTS_ENDPOINT}?userId=${userId}&postId=${postId}`);
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

export const likePost = async (userId: string, postId: string) => {
    try {
        const response = await api.post(LIKE_POST_ENDPOINT, { userId, postId });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error liking the post:", error.message);
        } else {
            console.error("Unknown error while liking the post");
        }
        throw error; // Re-throws the error to be handled by the caller
    }
};

export const addComment = async (userId: string, postId: string, comment: string) => {
    try {
        const response = await api.post(ADD_POST_COMMENT_ENDPOINT, { userId, postId, comment });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error adding the comment:", error.message);
        } else {
            console.error("Unknown error while adding the comment");
        }
        throw error; // Re-throws the error to be handled by the caller
    }
};

export const followUser = async (followerId: string, followingId: string) => {
    try {
        const response = await api.post(FOLLOW_ENDPOINT, { followerId, followingId });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to send follow request:", error.message);
        } else {
            console.error("Failed to send follow request: Unknown error");
        }
        throw error;
    }
};

export const getSearchResults = async (searchQuery: string) => {
    try {
        const response = await api.get(`${SEARCH_ENDPOINT}?searchString=${searchQuery}`);

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

export const getUserMessageDetails = async (userId: string) => {
    try {
        const response = await api.get(`${CHAT_USER_DETAILS_ENDPOINT}/${userId}`);

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

export const getNotifications = async (userId: string) => {
    try {
        const response = await api.get(`${GET_NOTIFICATIONS_ENDPOINT}/${userId}`);

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

export const getNotificationsCount = async (userId: string) => {
    try {
        const response = await api.get(`${GET_NOTIFICATIONS_COUNT}/${userId}`);

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
