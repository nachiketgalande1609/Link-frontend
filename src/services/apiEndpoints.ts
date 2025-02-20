// Auth Endpoints
export const REGISTER_ENDPOINT: string = "/api/auth/register";
export const LOGIN_ENDPOINT: string = "/api/auth/login";
export const GOOGLE_LOGIN_ENDPOINT: string = "/api/auth/google-login";

// User Endpoints
export const GET_PROFILE_ENDPOINT: string = "/api/users/profile";
export const UPLOAD_PROFILE_PICTURE_ENDPOINT: string = "/api/users/profile/picture";
export const UPDATE_PROFILE_ENDPOINT: string = "/api/users/profile/update";

// Follow Endpoints
export const FOLLOW_ENDPOINT: string = "/api/follow";
export const UNFOLLOW_ENDPOINT: string = "/api/follow/unfollow";
export const FOLLOW_RESPONSE_ENDPOINT: string = "/api/follow/response";
export const FOLLOWING_USERS_LIST_ENDPOINT: string = "/api/follow/following";

// Post Endpoints
export const POSTS_ENDPOINT: string = "/api/posts";
export const UPDATE_POST_ENDPOINT: string = "/api/posts/update";
export const LIKE_POST_ENDPOINT: string = "/api/posts/like";
export const COMMENT_ENDPOINT: string = "/api/posts/comment";
export const GET_SAVED_POSTS_ENDPOINT: string = "/api/posts/saved";
export const SAVE_POST_ENDPOINT: string = "/api/posts/save";

// Notifications Endpoints
export const GET_NOTIFICATIONS_ENDPOINT: string = "/api/notifications";
export const GET_NOTIFICATIONS_COUNT: string = "/api/notifications/count";

// Search Endpoints
export const SEARCH_ENDPOINT: string = "/api/search";
export const SEARCH_HISTORY_ENDPOINT: string = "/api/search/history";

// Settings Endpoints
export const SETTINGS_ENDPOINT: string = "/api/settings";

// Messages Endpoints
export const GET_ALL_MESSAGES_ENDPOINT: string = "/api/messages";
export const DELETE_MESSAGE_ENDPOINT: string = "/api/messages";
export const SHARE_MEDIA_ENDPOINT: string = "/api/messages/media";

// Stories Endpoints
export const UPLOAD_STORY_ENDPOINT: string = "/api/stories/upload";
export const FETCH_USER_STORIES_ENDPOINT: string = "/api/stories/";
