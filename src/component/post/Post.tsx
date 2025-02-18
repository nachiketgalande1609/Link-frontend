import React, { useState, useRef } from "react";
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    IconButton,
    Avatar,
    Grid,
    Box,
    CardMedia,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from "@mui/material";

import { FavoriteBorder, Favorite, ChatBubbleOutline, MoreVert, BookmarkBorderOutlined, Bookmark } from "@mui/icons-material";

import { deletePost, likePost, addComment, updatePost, savePost } from "../../services/api"; // Assuming you have an updatePost function in your API
import ScrollableCommentsDrawer from "./ScrollableCommentsDrawer";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@toolpad/core/useNotifications";

interface PostProps {
    username: string;
    content: string;
    likes: number;
    comments: number;
    avatarUrl?: string;
    fileUrl?: string;
    timeAgo: string;
    postId: string;
    userId: string;
    fetchPosts: () => Promise<void>;
    hasUserLikedPost: boolean;
    initialComments: Array<{
        id: number;
        post_id: string;
        user_id: string;
        content: string;
        parent_comment_id: null | number;
        created_at: string;
        updated_at: string;
        commenter_username: string;
        commenter_profile_picture: string;
        timeAgo: string;
    }>;
    borderRadius: string;
    imageHeight: number;
    imageWidth: number;
    savedByCurrentUser: boolean;
}

const Post: React.FC<PostProps> = ({
    username,
    content,
    likes,
    comments,
    avatarUrl,
    fileUrl,
    timeAgo,
    postId,
    userId,
    fetchPosts,
    hasUserLikedPost,
    initialComments,
    borderRadius,
    imageHeight,
    imageWidth,
    savedByCurrentUser,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const notifications = useNotifications();

    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(comments);
    const [postComments, setPostComments] = useState(initialComments);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);

    const [isLiked, setIsLiked] = useState(hasUserLikedPost);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const postRef = useRef<HTMLDivElement>(null);
    const postWidth = postRef?.current?.offsetWidth || 0;
    const [isImageLoading, setIsImageLoading] = useState(true); // Track image loading state

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const commentInputRef = useRef<HTMLInputElement>(null);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    };

    const handleFocusCommentField = () => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    const handleOptionsDialogClose = () => {
        setOptionsDialogOpen(false);
    };

    const handleOptionsDialogOpen = () => {
        setOptionsDialogOpen(true);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleLike = async () => {
        try {
            await likePost(currentUser.id, postId);
            setIsLiked(!isLiked);
            fetchPosts();
        } catch (error) {
            console.log(error);
        }
    };

    const handleComment = async () => {
        if (commentText) {
            try {
                const response = await addComment(currentUser.id, postId, commentText);
                if (response?.success) {
                    const newComment = {
                        id: Date.now(),
                        post_id: postId,
                        user_id: currentUser.id,
                        content: commentText,
                        parent_comment_id: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        commenter_username: currentUser.username,
                        commenter_profile_picture: currentUser.profile_picture_url,
                        timeAgo: "Just now",
                    };
                    setPostComments([newComment, ...postComments]);
                    setCommentText("");
                    setCommentCount(commentCount + 1);
                    fetchPosts();
                }
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }
    };

    const handleDelete = async () => {
        try {
            const res = await deletePost(userId, postId);
            if (res?.success) {
                fetchPosts();
            }
            setDialogOpen(false);
        } catch (error) {}
    };

    const handleCancel = () => {
        setDialogOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent("");
    };

    const handleEditClick = () => {
        setEditedContent(content);
        setIsEditing(true);
    };

    const handleSavePost = async () => {
        try {
            const res = await savePost(currentUser?.id, postId);
            if (res.success) {
                fetchPosts();
                if (!savedByCurrentUser) {
                    notifications.show(`Post has been saved!`, {
                        severity: "success",
                        autoHideDuration: 3000,
                    });
                }
            }
        } catch (error) {
            console.error("Error saving post:", error);
            alert("An error occurred while saving the post.");
        }
    };

    const handleSaveEdit = async () => {
        try {
            const response = await updatePost(postId, editedContent);
            if (response?.success) {
                setIsEditing(false);
                fetchPosts();
                setEditedContent(""); // Reset the content after saving
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    const handleDoubleClickLike = async () => {
        if (!isLiked) {
            await handleLike();
        }
    };

    return (
        <Card sx={{ position: "relative", borderRadius: isMobile ? 0 : borderRadius, width: "100%" }}>
            <CardContent sx={{ padding: 0, backgroundColor: isMobile ? "#000000" : "#101114" }}>
                {fileUrl && (
                    <Box
                        ref={postRef}
                        sx={{ position: "relative", width: "100%", height: postWidth ? (imageHeight / imageWidth) * postWidth : postWidth }}
                        onDoubleClick={handleDoubleClickLike}
                    >
                        {isImageLoading && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1,
                                }}
                            >
                                <CircularProgress color="inherit" />
                            </Box>
                        )}
                        <CardMedia
                            component="img"
                            image={fileUrl}
                            alt="Post Image"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "20px",
                            }}
                            onLoad={handleImageLoad} // Set image loaded
                        />
                    </Box>
                )}
            </CardContent>

            <CardActions
                sx={{ justifyContent: "space-between", height: "60px", padding: "0px 8px", backgroundColor: isMobile ? "#000000" : "#101114" }}
            >
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <IconButton onClick={handleLike} sx={{ color: isLiked ? "red" : "white", ":hover": { backgroundColor: "transparent" } }}>
                            {isLiked ? <Favorite sx={{ fontSize: isMobile ? "26px" : "30px" }} /> : <FavoriteBorder sx={{ fontSize: "30px" }} />}
                        </IconButton>
                        <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                            {likes}
                        </Typography>

                        <IconButton sx={{ color: "#ffffff", ":hover": { backgroundColor: "transparent" } }} onClick={handleFocusCommentField}>
                            <ChatBubbleOutline sx={{ fontSize: isMobile ? "26px" : "30px" }} onClick={() => setDrawerOpen(true)} />
                        </IconButton>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            {commentCount}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <IconButton sx={{ color: "#ffffff", ":hover": { backgroundColor: "transparent" } }} onClick={handleSavePost}>
                            {savedByCurrentUser ? (
                                <Bookmark sx={{ fontSize: isMobile ? "26px" : "30px" }} />
                            ) : (
                                <BookmarkBorderOutlined sx={{ fontSize: isMobile ? "26px" : "30px" }} />
                            )}
                        </IconButton>
                        <IconButton onClick={handleOptionsDialogOpen} sx={{ padding: "0" }}>
                            <MoreVert />
                        </IconButton>
                    </Box>
                </Box>
            </CardActions>

            <Box sx={{ padding: isMobile ? "0 14px" : "0 16px", backgroundColor: isMobile ? "#000000" : "#101114" }}>
                <Grid container spacing={2} alignItems="flex-start">
                    {/* Avatar */}
                    <Grid item>
                        <Avatar
                            src={
                                avatarUrl ||
                                "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                            }
                            alt={username}
                            sx={{ width: 52, height: 52, cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${userId}`)}
                        />
                    </Grid>

                    {/* Username */}
                    <Grid item xs zeroMinWidth>
                        <Typography
                            sx={{
                                fontSize: isMobile ? "0.85rem" : "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate(`/profile/${userId}`)}
                        >
                            {username}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: isMobile ? "0.8rem" : "0.9rem",
                                mt: 0.5,
                                backgroundColor: isMobile ? "#000000" : "#101114",
                            }}
                        >
                            {content}
                        </Typography>
                    </Grid>

                    {/* More Options (Only for post owner) */}
                    {currentUser?.id === userId && <Grid item></Grid>}
                </Grid>
            </Box>

            <Box sx={{ padding: "16px", backgroundColor: isMobile ? "#000000" : "#101114" }}>
                <Typography sx={{ fontSize: isMobile ? "0.65rem" : "0.8rem", color: "#666666" }}>{timeAgo}</Typography>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCancel}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                    },
                }}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">Are you sure you want to delete this post? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ padding: "16px" }}>
                    <Button onClick={handleCancel} size="large" sx={{ color: "#ffffff", borderRadius: "15px" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} size="large" variant="contained" color="error" sx={{ borderRadius: "15px" }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Modal for Editing Post */}
            <Dialog
                open={isEditing}
                onClose={handleCancelEdit}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        width: "90%",
                        maxWidth: "600px",
                        padding: "20px",
                        backgroundColor: "#000000",
                    },
                }}
            >
                <DialogContent sx={{ padding: 0 }}>
                    <TextField
                        fullWidth
                        multiline
                        size="small"
                        variant="standard"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {},
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: "0" }}>
                    <Button onClick={handleCancelEdit} size="small" sx={{ color: "#ffffff", borderRadius: "15px" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} size="small" variant="contained" color="primary" sx={{ borderRadius: "15px" }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={optionsDialogOpen}
                onClose={handleOptionsDialogClose}
                fullWidth
                maxWidth="xs"
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        backgroundColor: "rgba(32, 35, 39, 0.9)",
                        color: "white",
                        textAlign: "center",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                }}
            >
                <Button
                    fullWidth
                    onClick={() => {
                        handleEditClick();
                        handleOptionsDialogClose();
                    }}
                    sx={{
                        padding: "10px",
                        fontSize: "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                        borderBottom: "1px solid #505050",
                    }}
                >
                    Edit Post
                </Button>

                <Button
                    fullWidth
                    onClick={() => {
                        handleDialogOpen();
                        handleOptionsDialogClose();
                    }}
                    sx={{
                        padding: "10px",
                        fontSize: "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                        borderBottom: "1px solid #505050",
                    }}
                >
                    Delete Post
                </Button>

                <Button
                    fullWidth
                    onClick={handleOptionsDialogClose}
                    sx={{
                        padding: "10px",
                        fontSize: "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                    }}
                >
                    Cancel
                </Button>
            </Dialog>

            <ScrollableCommentsDrawer
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                postComments={postComments}
                handleComment={handleComment}
                commentText={commentText}
                setCommentText={setCommentText}
                commentInputRef={commentInputRef}
                content={content}
                username={username}
                avatarUrl={avatarUrl}
            />
        </Card>
    );
};

export default Post;
