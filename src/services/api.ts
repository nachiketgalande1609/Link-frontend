import api from "./config";
import {
    REGISTER_ENDPOINT,
    LOGIN_ENDPOINT,
    GET_POSTS_ENDPOINT,
    GET_PROFILE_POSTS_ENDPOINT,
    GET_PROFILE_ENDPOINT,
    LIKE_POST_ENDPOINT,
    COMMENT_ENDPOINT,
    FOLLOW_ENDPOINT,
    SEARCH_ENDPOINT,
    GET_NOTIFICATIONS_ENDPOINT,
    UPDATE_POST_ENDPOINT,
    GOOGLE_LOGIN_ENDPOINT,
    GET_NOTIFICATIONS_COUNT,
    FOLLOW_RESPONSE_ENDPOINT,
    SEARCH_HISTORY_ENDPOINT,
    UPLOAD_PROFILE_PICTURE_ENDPOINT,
    UPDATE_PROFILE_ENDPOINT,
    SETTINGS_ENDPOINT,
    GET_ALL_MESSAGES_ENDPOINT,
    SHARE_MEDIA_ENDPOINT,
    FOLLOWING_USERS_LIST_ENDPOINT,
    GET_SAVED_POSTS_ENDPOINT,
    SAVE_POST_ENDPOINT,
    UNFOLLOW_ENDPOINT,
    UPLOAD_STORY_ENDPOINT,
    FETCH_USER_STORIES_ENDPOINT,
    DELETE_MESSAGE_ENDPOINT,
    CREATE_POST_ENDPOINT,
    DELETE_POST_ENDPOINT,
} from "./apiEndpoints";

interface UserRegisterData {
    email: string;
    username: string;
    password: string;
    publicKey?: string;
    encryptedPrivateKey?: string;
}

interface UserLoginData {
    email: string;
    password: string;
}

interface PostData {
    user_id: string;
    content: string;
    image?: File;
    location: string;
}

interface ProfileData {
    username?: string;
    profile_picture_url?: string;
    bio?: string;
}

interface StoryData {
    user_id: string;
    caption: string;
    media: File;
}

export interface Story {
    story_id: number;
    user_id: number;
    media_url: string;
    media_type: "image" | "video";
    caption: string;
    created_at: string;
    expires_at: string;
    media_width: number | null;
    media_height: number | null;
    username: string;
    profile_picture: string | null;
}

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// AUTHENTICATION APIS ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// USER APIS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export const getProfile = async (userId: string, currentUserId: string) => {
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

export const uploadProfilePicture = async (userId: string, profilePic: File) => {
    try {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("profile_pic", profilePic);

        const response = await api.post(UPLOAD_PROFILE_PICTURE_ENDPOINT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

export const updateProfileDetails = async (userId: string, updatedProfile: ProfileData) => {
    try {
        const response = await api.put(UPDATE_PROFILE_ENDPOINT, { userId, updatedProfile });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to update profile:", error.message);
        } else {
            console.error("Failed to update profile: Unknown error");
        }
        throw error;
    }
};

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FOLLOW APIS ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

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

export const unfollowUser = async (followerId: string, followingId: string) => {
    try {
        const response = await api.delete(UNFOLLOW_ENDPOINT, {
            data: { followerId, followingId },
        });
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

export const respondToFollowRequest = async (requestId: number, status: string) => {
    try {
        const res = await api.post(FOLLOW_RESPONSE_ENDPOINT, { requestId, status });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to send follow request:", error.message);
        } else {
            console.error("Failed to send follow request: Unknown error");
        }
        throw error;
    }
};

export const getFollowingUsers = async (userId: string) => {
    try {
        const response = await api.get(`${FOLLOWING_USERS_LIST_ENDPOINT}/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to fetch following users:", error.message);
        } else {
            console.error("Failed to fetch following users: Unknown error");
        }
        throw error;
    }
};

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// POST APIS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export const getPosts = async (userId: string) => {
    try {
        const response = await api.get(`${GET_POSTS_ENDPOINT}?userId=${userId}`);

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
        throw error;
    }
};

export const addComment = async (userId: string, postId: string, comment: string) => {
    try {
        const response = await api.post(COMMENT_ENDPOINT, { userId, postId, comment });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error adding the comment:", error.message);
        } else {
            console.error("Unknown error while adding the comment");
        }
        throw error;
    }
};

export const deleteComment = async (userId: string, commentId: number) => {
    try {
        const response = await api.delete(COMMENT_ENDPOINT, { data: { userId, commentId } });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error deleting the comment:", error.message);
        } else {
            console.error("Unknown error while deleting the comment");
        }
        throw error;
    }
};

export const getSavedPosts = async (userId: string) => {
    try {
        const response = await api.get(`${GET_SAVED_POSTS_ENDPOINT}?userId=${userId}`);

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

export const savePost = async (userId: string, postId: string) => {
    try {
        const response = await api.post(SAVE_POST_ENDPOINT, {
            userId,
            postId,
        });

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

export const getUserPosts = async (currentUserId: string, userId: string) => {
    try {
        const response = await api.post(`${GET_PROFILE_POSTS_ENDPOINT}/${userId}`, { currentUserId });
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
        const formData = new FormData();
        formData.append("user_id", postData.user_id);
        formData.append("content", postData.content);
        formData.append("location", postData.location);

        if (postData.image) {
            formData.append("image", postData.image);
        }

        const response = await api.post(CREATE_POST_ENDPOINT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

export const deletePost = async (userId: number, postId: string) => {
    try {
        const response = await api.delete(`${DELETE_POST_ENDPOINT}?userId=${userId}&postId=${postId}`);
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

////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// NOTIFICATIONS APIS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// SEARCH APIS ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

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

export const getSearchHistory = async (userId: number) => {
    try {
        const response = await api.get(`${SEARCH_HISTORY_ENDPOINT}?userId=${userId}`);

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

export const addToSearchHistory = async (currentUserId: number, targetUserId: number) => {
    try {
        const response = await api.post(SEARCH_HISTORY_ENDPOINT, { userId: currentUserId, target_user_id: targetUserId });

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

export const deleteSearchHistoryItem = async (currentUserId: number, historyId: number) => {
    try {
        const response = await api.delete(SEARCH_HISTORY_ENDPOINT, {
            params: { userId: currentUserId, historyId: historyId },
        });

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

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// SETTINGS APIS //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

export const updatePrivacy = async (userId: number, isPrivate: boolean) => {
    try {
        const response = await api.patch(`${SETTINGS_ENDPOINT}/privacy`, { userId, isPrivate });
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

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// MESSAGES APIS //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

export const getAllMessagesData = async (userId: string) => {
    try {
        const response = await api.get(`${GET_ALL_MESSAGES_ENDPOINT}/${userId}`);

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

export const deleteMessage = async (messageId: number, currentUserId: number) => {
    try {
        const response = await api.delete(`${DELETE_MESSAGE_ENDPOINT}/${messageId}`, {
            params: { currentUserId },
        });

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

export const shareChatMedia = async (mediaMessageData: FormData): Promise<any> => {
    try {
        const response = await api.post(SHARE_MEDIA_ENDPOINT, mediaMessageData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// STORIES APIS //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

export const uploadStory = async (storyData: StoryData) => {
    try {
        const formData = new FormData();
        formData.append("user_id", storyData.user_id);
        formData.append("caption", storyData.caption);
        formData.append("media", storyData.media);

        const response = await api.post(UPLOAD_STORY_ENDPOINT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

export const getStories = async (userId: number) => {
    try {
        const response = await api.get(`${FETCH_USER_STORIES_ENDPOINT}?userId=${userId}`);
        return response;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};
