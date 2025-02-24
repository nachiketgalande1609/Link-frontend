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

import { FavoriteBorder, Favorite, MoreVert, BookmarkBorderOutlined, Bookmark, LocationOn, Close } from "@mui/icons-material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

import { deletePost, likePost, addComment, updatePost, savePost, deleteComment } from "../../services/api"; // Assuming you have an updatePost function in your API
import ScrollableCommentsDrawer from "./ScrollableCommentsDrawer";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@toolpad/core/useNotifications";
import ImageDialog from "../ImageDialog";

interface Post {
    username: string;
    content: string;
    like_count: number;
    avatarUrl?: string;
    file_url?: string;
    timeAgo: string;
    id: string;
    userId: string;
    liked_by_current_user: boolean;
    media_height: number;
    media_width: number;
    savedByCurrentUser: boolean;
    profile_picture: string;
    user_id: number;
    comment_count: number;
    saved_by_current_user: boolean;
    location: string;
    comments: Array<{
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
}

interface PostProps {
    post: Post;
    fetchPosts: () => Promise<void>;
    borderRadius: string;
    isSaved?: boolean;
}

const Post: React.FC<PostProps> = ({ post, fetchPosts, borderRadius, isSaved }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const notifications = useNotifications();

    const [commentText, setCommentText] = useState("");
    const [comment_count, setCommentCount] = useState(post.comment_count);
    const [postComments, setPostComments] = useState(post.comments);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const [isLiked, setIsLiked] = useState(post.liked_by_current_user);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const postRef = useRef<HTMLDivElement>(null);
    const postWidth = postRef?.current?.offsetWidth || 0;
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

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
            await likePost(currentUser.id, post.id);
            setIsLiked(!isLiked);
            fetchPosts();
        } catch (error) {
            console.log(error);
        }
    };

    const handleComment = async () => {
        if (commentText) {
            try {
                const response = await addComment(currentUser.id, post.id, commentText);
                if (response?.success) {
                    const newComment = {
                        id: Date.now(),
                        post_id: post.id,
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
                    setCommentCount(comment_count + 1);
                    fetchPosts();
                }
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }
    };

    const handleDeleteComment = async () => {
        if (selectedCommentId) {
            try {
                const res = await deleteComment(currentUser?.id, selectedCommentId);
                if (res?.success) {
                    const updatedComments = postComments.filter((comment) => comment.id !== selectedCommentId);
                    setPostComments(updatedComments);
                    fetchPosts();
                }
            } catch (error) {
                console.error("Error deleting comment:", error);
            }
        }
    };

    const handleDelete = async () => {
        try {
            const res = await deletePost(post.user_id, post.id);
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
        setEditedContent(post.content);
        setIsEditing(true);
    };

    const handleCloseDialog = () => {
        setOpenImageDialog(false);
    };

    const handleSavePost = async () => {
        try {
            const res = await savePost(currentUser?.id, post.id);
            if (res.success) {
                fetchPosts();
                if (!post.saved_by_current_user) {
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
            const response = await updatePost(post.id, editedContent);
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
                {post.file_url && (
                    <Box
                        ref={postRef}
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: postWidth ? (post.media_height / post.media_width) * postWidth : postWidth || "400px",
                            cursor: "pointer",
                        }}
                        onDoubleClick={handleDoubleClickLike}
                        onClick={() => setOpenImageDialog(true)}
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
                            image={post.file_url}
                            alt="Post Image"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onLoad={handleImageLoad}
                        />
                    </Box>
                )}
            </CardContent>
            <Box
                sx={{
                    backgroundColor: isMobile ? "#000000" : "#101114",
                    display: "flex",
                    alignItems: "center",
                }}
            ></Box>

            <CardActions
                sx={{ justifyContent: "space-between", height: "60px", padding: "0px 8px", backgroundColor: isMobile ? "#000000" : "#101114" }}
            >
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <IconButton onClick={handleLike} sx={{ color: isLiked ? "red" : "white", ":hover": { backgroundColor: "transparent" } }}>
                            {isLiked ? <Favorite sx={{ fontSize: isMobile ? "26px" : "30px" }} /> : <FavoriteBorder sx={{ fontSize: "30px" }} />}
                        </IconButton>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            {post.like_count}
                        </Typography>

                        <IconButton sx={{ color: "#ffffff", ":hover": { backgroundColor: "transparent" } }} onClick={handleFocusCommentField}>
                            <FontAwesomeIcon icon={faComment} style={{ fontSize: "28px" }} onClick={() => setDrawerOpen(true)} />
                        </IconButton>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            {post.comment_count}
                        </Typography>

                        <IconButton sx={{ color: "#ffffff", ":hover": { backgroundColor: "transparent" } }} onClick={handleFocusCommentField}>
                            <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "26 px" }} onClick={() => setDrawerOpen(true)} />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <IconButton sx={{ color: "#ffffff", ":hover": { backgroundColor: "transparent" } }} onClick={handleSavePost}>
                            {post.saved_by_current_user || isSaved ? (
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
                    <Grid item>
                        <Avatar
                            src={
                                post.profile_picture ||
                                "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                            }
                            alt={post.username}
                            sx={{ width: 52, height: 52, cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                        />
                    </Grid>

                    {/* Username */}
                    <Grid item xs zeroMinWidth>
                        <Typography
                            sx={{
                                fontSize: "0.9rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                        >
                            {post.username}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "0.9rem",
                                mt: 0.5,
                                backgroundColor: isMobile ? "#000000" : "#101114",
                            }}
                        >
                            {post.content}
                        </Typography>
                    </Grid>

                    {/* More Options (Only for post owner) */}
                    {currentUser?.id === post.user_id && <Grid item></Grid>}
                </Grid>
            </Box>

            <Box sx={{ padding: "16px", backgroundColor: isMobile ? "#000000" : "#101114", display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: isMobile ? "0.65rem" : "0.8rem", color: "#666666" }}>{post.timeAgo}</Typography>
                {post.location && (
                    <Box sx={{ display: "flex" }}>
                        <LocationOn sx={{ fontSize: isMobile ? "0.8rem" : "1.1rem", color: "#666666", mr: 0.5 }} />
                        <Typography sx={{ fontSize: "0.8rem", color: "#666666" }}>{post.location}</Typography>
                    </Box>
                )}
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
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">Are you sure you want to delete this post? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ padding: "16px" }}>
                    <Button onClick={handleCancel} size="medium" sx={{ color: "#ffffff", borderRadius: "15px" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} size="medium" variant="outlined" color="error" sx={{ borderRadius: "15px" }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Modal for Editing Post */}
            <Dialog
                open={isEditing}
                onClose={handleCancelEdit}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
                    },
                }}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        width: "90%",
                        maxWidth: "600px",
                        backgroundColor: "rgba(0, 0, 0)", // Slight transparency
                        overflow: "hidden",
                    },
                }}
            >
                {/* Image Section */}
                {post.file_url && (
                    <Box sx={{ position: "relative" }}>
                        <CardMedia
                            component="img"
                            image={post.file_url}
                            alt="Post Image"
                            sx={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "10px 10px 0 0",
                            }}
                        />
                        {/* Cancel Button (Cross Icon) */}
                        <IconButton
                            onClick={handleCancelEdit}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: "#ffffff",
                                padding: "6px",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                },
                            }}
                        >
                            <Close sx={{ fontSize: "18px" }} /> {/* Import Close icon from @mui/icons-material */}
                        </IconButton>
                    </Box>
                )}

                {/* TextField and Save Button Section */}
                <Box sx={{ padding: "16px 8px 16px 16px" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            size="small"
                            variant="standard"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            sx={{
                                flex: 1,
                                "& .MuiInput-underline:before": {
                                    borderBottom: "none !important",
                                },
                                "& .MuiInput-underline:after": {
                                    borderBottom: "none !important",
                                },
                                "& .MuiInput-underline:hover:before": {
                                    borderBottom: "none !important",
                                },
                            }}
                        />
                        {/* Save Button */}
                        <Button
                            onClick={handleSaveEdit}
                            size="medium"
                            color="primary"
                            sx={{ textTransform: "none", "&:hover": { backgroundColor: "transparent" }, padding: 0, width: "20px" }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
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
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
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
                content={post.content}
                username={post.username}
                avatarUrl={post.profile_picture}
                setSelectedCommentId={setSelectedCommentId}
                handleDeleteComment={handleDeleteComment}
            />

            <ImageDialog openDialog={openImageDialog} handleCloseDialog={handleCloseDialog} selectedImage={post.file_url || ""} />
        </Card>
    );
};

export default Post;
