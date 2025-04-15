import React, { useState, useRef, useEffect } from "react";
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
    Menu,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Popover,
    CircularProgress,
    Skeleton,
} from "@mui/material";
import { FavoriteBorder, Favorite, MoreVert, MoreHoriz } from "@mui/icons-material";
import { deletePost, likePost, addComment, updatePost, deleteComment, toggleLikeComment, getUserPostDetails } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import ImageDialog from "../ImageDialog";
import { SentimentSatisfiedAlt as EmojiIcon } from "@mui/icons-material";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useNotifications } from "@toolpad/core/useNotifications";

type Post = {
    username: string;
    content: string;
    like_count: number;
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
        likes_count: number;
        liked_by_user: boolean;
    }>;
};

interface PostProps {
    postId: string;
    userId: string | undefined;
    fetchPosts: () => Promise<void>;
    borderRadius: string;
    isMobile: boolean;
    handleCloseModal: () => void;
}

const ModalPost: React.FC<PostProps> = ({ postId, fetchPosts, borderRadius, isMobile, handleCloseModal, userId }) => {
    const [commentText, setCommentText] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [commentOptionsDialogOpen, setCommentOptionsDialog] = useState(false);
    const [confirmDeleteButtonVisibile, setConfirmDeleteButtonVisibile] = useState<boolean>(false);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const [hoveredCommentId, setHoveredCommentId] = useState<number | null>(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
    const notifications = useNotifications();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [fetchingPostDetails, setFetchingPostDetails] = useState(false);
    const [post, setPost] = useState<Post | null>(null);

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const commentInputRef = useRef<HTMLInputElement>(null);

    const visibleComments = showAllComments ? post?.comments || [] : (post?.comments || []).slice(0, 2);

    const handleFocusCommentField = () => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    async function fetchUserPosts() {
        try {
            setFetchingPostDetails(true);
            if (userId) {
                const res = await getUserPostDetails(userId, postId);
                setPost(res.data);
                setEditedContent(res.data.content);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setFetchingPostDetails(false);
        }
    }

    useEffect(() => {
        fetchUserPosts();
    }, [postId, userId]);

    const handleLike = async () => {
        if (!post) return;

        const previousIsLiked = post?.liked_by_current_user;
        const previousLikes = post?.like_count;

        // Optimistic update
        setPost({
            ...post,
            liked_by_current_user: !previousIsLiked,
            like_count: previousIsLiked ? previousLikes - 1 : previousLikes + 1,
        });

        try {
            await likePost(post?.id);
            fetchPosts();
        } catch (error) {
            notifications.show(`Failed to ${previousIsLiked ? "unlike" : "like"} the post. Please try again later.`, {
                severity: "error",
                autoHideDuration: 3000,
            });
            console.log(error);
            // Revert on error
            setPost({
                ...post,
                liked_by_current_user: previousIsLiked,
                like_count: previousLikes,
            });
        }
    };

    const handleComment = async () => {
        if (!post || !commentText) return;

        try {
            const response = await addComment(post?.id, commentText);
            if (response?.success) {
                const newComment = {
                    id: Date.now(),
                    post_id: post?.id,
                    user_id: currentUser.id,
                    content: commentText,
                    parent_comment_id: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    commenter_username: currentUser.username,
                    commenter_profile_picture: currentUser.profile_picture_url,
                    timeAgo: "Just now",
                    likes_count: 0,
                    liked_by_user: false,
                };

                setPost({
                    ...post,
                    comments: [newComment, ...post?.comments],
                    comment_count: post?.comment_count + 1,
                });
                setCommentText("");
                fetchPosts();
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleDeleteComment = async () => {
        if (!post || !selectedCommentId) return;

        try {
            const res = await deleteComment(selectedCommentId);
            if (res?.success) {
                setPost({
                    ...post,
                    comments: post?.comments.filter((comment) => comment.id !== selectedCommentId),
                    comment_count: post?.comment_count - 1,
                });
                fetchPosts();
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setCommentOptionsDialog(false);
            setSelectedCommentId(null);
            setConfirmDeleteButtonVisibile(false);
        }
    };

    const handleLikeComment = async (commentId: number) => {
        if (!post) return;

        // Find the comment to update
        const commentToUpdate = post?.comments.find((comment) => comment.id === commentId);
        if (!commentToUpdate) return;

        const newLikedStatus = !commentToUpdate.liked_by_user;
        const newLikeCount = newLikedStatus ? commentToUpdate.likes_count + 1 : commentToUpdate.likes_count - 1;

        // Optimistic update
        setPost({
            ...post,
            comments: post?.comments.map((comment) =>
                comment.id === commentId ? { ...comment, liked_by_user: newLikedStatus, likes_count: newLikeCount } : comment
            ),
        });

        try {
            await toggleLikeComment(commentId);
        } catch (error) {
            console.error("Failed to like/unlike comment:", error);
            // Revert on error
            setPost({
                ...post,
                comments: post?.comments.map((comment) =>
                    comment.id === commentId
                        ? { ...comment, liked_by_user: commentToUpdate.liked_by_user, likes_count: commentToUpdate.likes_count }
                        : comment
                ),
            });

            notifications.show(`Failed to ${newLikedStatus ? "like" : "unlike"} the comment. Please try again later.`, {
                severity: "error",
                autoHideDuration: 3000,
            });
        }
    };

    const handleDelete = async () => {
        if (!post) return;

        try {
            const res = await deletePost(post?.id);
            if (res?.success) {
                fetchPosts();
                handleCloseModal();
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteClick = () => {
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleEditClick = () => {
        setIsEditing(true);
        handleMenuClose();
    };

    const handleCancel = () => {
        setDialogOpen(false);
    };

    const handleCloseDialog = () => {
        setOpenImageDialog(false);
    };

    const handleOpenCommentOptionsDialog = (commentId: number) => {
        setSelectedCommentId(commentId);
        setCommentOptionsDialog(true);
    };

    const handleCloseCommentOptionsDialog = () => {
        setCommentOptionsDialog(false);
        setSelectedCommentId(null);
        setConfirmDeleteButtonVisibile(false);
    };

    const handleSaveEdit = async () => {
        if (!post) return;

        try {
            const response = await updatePost(post?.id, editedContent);
            if (response?.success) {
                setIsEditing(false);
                setPost({
                    ...post,
                    content: editedContent,
                });
                fetchPosts();
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setCommentText((prev) => prev + emojiData.emoji);
    };

    return (
        <Card
            sx={{
                borderRadius: { borderRadius },
                "& .MuiCardContent-root": {
                    padding: 0,
                    backgroundColor: "black",
                },
                padding: 0,
            }}
        >
            <CardContent
                sx={{
                    padding: "0px !important",
                }}
            >
                {fetchingPostDetails ? (
                    <Box sx={{ p: 0 }}>
                        <Grid container spacing={2}>
                            {/* Left column for image skeleton */}
                            <Grid item xs={12} sm={6}>
                                <Skeleton variant="rectangular" width="100%" height={500} />
                            </Grid>

                            {/* Right column for content skeleton */}
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2, p: "20px 0" }}>
                                    <Skeleton variant="circular" width={50} height={50} />
                                    <Box sx={{ ml: 2 }}>
                                        <Skeleton variant="text" width={100} height={20} />
                                        <Skeleton variant="text" width={80} height={16} />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Skeleton variant="text" width="80%" height={24} />
                                    <Skeleton variant="text" width="60%" height={24} />
                                </Box>

                                <Box sx={{ display: "flex", mb: 2 }}>
                                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Skeleton variant="text" width="100%" height={56} />
                                </Box>

                                <Box>
                                    {[1, 2, 3].map((item) => (
                                        <Box key={item} sx={{ display: "flex", mb: 2 }}>
                                            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Skeleton variant="text" width="60%" height={20} />
                                                <Skeleton variant="text" width="80%" height={16} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box sx={{}}>
                        <Grid container spacing={2}>
                            {/* Left column for image */}
                            <Grid item xs={12} sm={6}>
                                {post?.file_url && (
                                    <CardMedia
                                        component="img"
                                        image={post?.file_url}
                                        alt="Post Image"
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setOpenImageDialog(true)}
                                    />
                                )}
                            </Grid>

                            {/* Right column for post details */}
                            <Grid item xs={12} sm={6} sx={{ padding: "0px !important" }}>
                                <Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: isMobile ? "0 10px 10px 10px" : "35px 15px 5px 15px",
                                        }}
                                    >
                                        <Avatar
                                            src={
                                                post?.profile_picture ||
                                                "https://static-00.iconduck.com/assets.00/profile-major-icon-512x512-xosjbbdq.png"
                                            }
                                            alt={post?.username}
                                            sx={{ width: isMobile ? 42 : 52, height: isMobile ? 42 : 52 }}
                                        />
                                        <Box sx={{ ml: 2 }}>
                                            <Typography sx={{ fontSize: isMobile ? "0.85rem" : "1rem" }}>{post?.username}</Typography>
                                            <Typography sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} color="text.secondary">
                                                {post?.timeAgo}
                                            </Typography>
                                        </Box>
                                        {currentUser?.id && (
                                            <>
                                                <IconButton onClick={handleMenuOpen} sx={{ ml: "auto" }}>
                                                    <MoreVert sx={{ fontSize: isMobile ? "1rem" : "1.2rem" }} />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl)}
                                                    onClose={handleMenuClose}
                                                    sx={{
                                                        "& .MuiPaper-root": {
                                                            width: "150px",
                                                            padding: "3px 10px",
                                                            borderRadius: "20px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleEditClick}>
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleDeleteClick}>
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            </>
                                        )}
                                    </Box>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        sx={{
                                            "& .MuiPaper-root": {
                                                width: "150px",
                                                padding: "3px 10px",
                                                borderRadius: "20px",
                                            },
                                        }}
                                    >
                                        <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleEditClick}>
                                            Edit
                                        </MenuItem>
                                        <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleDeleteClick}>
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                    {currentUser?.id && (
                                        <CardActions
                                            sx={{
                                                justifyContent: "space-between",
                                                marginTop: "16px",
                                                padding: isMobile ? "0 10px 10px 10px" : "0 15px",
                                            }}
                                        >
                                            <Box>
                                                <IconButton
                                                    onClick={handleLike}
                                                    sx={{ color: post?.liked_by_current_user ? "#FF3040" : "#787a7a", padding: "0" }}
                                                >
                                                    {post?.liked_by_current_user ? (
                                                        <Favorite sx={{ fontSize: "35px", mr: 1 }} />
                                                    ) : (
                                                        <FavoriteBorder sx={{ fontSize: "35px", mr: 1 }} />
                                                    )}
                                                </IconButton>
                                                <Typography variant="body2" component="span" sx={{ mr: 2, color: "#787a7a" }}>
                                                    {post?.like_count}
                                                </Typography>
                                                <IconButton onClick={handleFocusCommentField} sx={{ color: "#787a7a", padding: "0", mr: 1 }}>
                                                    <FontAwesomeIcon icon={faComment} style={{ fontSize: "31px" }} />
                                                </IconButton>
                                                <Typography variant="body2" component="span" sx={{ mr: 1, color: "#787a7a" }}>
                                                    {post?.comment_count}
                                                </Typography>
                                            </Box>
                                        </CardActions>
                                    )}

                                    {currentUser?.id && isEditing ? (
                                        <Box sx={{ mt: 2, padding: isMobile ? "0 10px 10px 10px" : "0 15px" }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                                sx={{
                                                    mb: 2,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "20px",
                                                    },
                                                }}
                                            />
                                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                                <Button onClick={() => setIsEditing(false)} variant="outlined" sx={{ borderRadius: "15px" }}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleSaveEdit} variant="outlined" color="primary" sx={{ borderRadius: "15px" }}>
                                                    Save
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography
                                            sx={{
                                                mt: 2,
                                                fontSize: isMobile ? "0.85rem" : "1rem",
                                                padding: isMobile ? "0 10px 10px 10px" : "0 15px",
                                            }}
                                        >
                                            {post?.content}
                                        </Typography>
                                    )}

                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: "flex",
                                            alignItems: "flex-start", // top alignment
                                            borderTop: "1px solid #202327",
                                            padding: isMobile ? "0 10px 10px 10px" : "15px",
                                            gap: 0,
                                        }}
                                    >
                                        {currentUser?.id && (
                                            <>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Add a comment..."
                                                    variant="standard"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    inputRef={commentInputRef}
                                                    sx={{
                                                        "& .MuiInput-underline:before": { borderBottom: "none !important" },
                                                        "& .MuiInput-underline:after": { borderBottom: "none !important" },
                                                        "& .MuiInput-underline:hover:before": { borderBottom: "none !important" },
                                                    }}
                                                />
                                                <IconButton size="small" onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                                                    <EmojiIcon />
                                                </IconButton>
                                                <Button
                                                    onClick={handleComment}
                                                    size="small"
                                                    sx={{ color: "#ffffff", borderRadius: "15px", alignSelf: "flex-start", mt: "2px" }}
                                                    disabled={!commentText}
                                                >
                                                    Post
                                                </Button>
                                            </>
                                        )}
                                    </Box>

                                    <Box sx={{ padding: isMobile ? "0 10px 10px 10px" : "15px", borderTop: "1px solid #202327" }}>
                                        {visibleComments.length === 0 ? (
                                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                <Typography variant="body2" color="#787a7a">
                                                    No comments yet
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    maxHeight: "50vh",
                                                    overflowY: "scroll",
                                                    paddingRight: 2,
                                                }}
                                            >
                                                {visibleComments.map((comment) => (
                                                    <Box key={comment.id} sx={{ mb: 3 }}>
                                                        <Box
                                                            sx={{ display: "flex", alignItems: "center" }}
                                                            onMouseEnter={() => setHoveredCommentId(comment.id)}
                                                            onMouseLeave={() => setHoveredCommentId(null)}
                                                        >
                                                            <Avatar
                                                                src={
                                                                    comment.commenter_profile_picture ||
                                                                    "https://static-00.iconduck.com/assets.00/profile-major-icon-512x512-xosjbbdq.png"
                                                                }
                                                                alt={comment.commenter_username}
                                                                sx={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40 }}
                                                            />
                                                            <Box sx={{ ml: 2, display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                                <Box>
                                                                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                                                                        <Typography variant="body2" color="text.primary">
                                                                            <strong
                                                                                style={{
                                                                                    fontWeight: "bold",
                                                                                    marginRight: "4px",
                                                                                    color: "#aaaaaa",
                                                                                }}
                                                                            >
                                                                                {comment.commenter_username}
                                                                            </strong>
                                                                        </Typography>
                                                                        {hoveredCommentId === comment.id && comment.user_id === currentUser.id && (
                                                                            <IconButton
                                                                                onClick={() => handleOpenCommentOptionsDialog(comment.id)}
                                                                                sx={{ color: "#aaaaaa", padding: 0 }}
                                                                            >
                                                                                <MoreHoriz sx={{ fontSize: 20 }} />
                                                                            </IconButton>
                                                                        )}
                                                                    </Box>
                                                                    <Typography variant="body2" color="text.primary">
                                                                        {comment.content}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="caption" sx={{ ml: 2, color: "#666666" }}>
                                                                    {comment.timeAgo}
                                                                </Typography>
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    ml: 2,
                                                                    gap: 0.3,
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleLikeComment(comment.id)}
                                                                    sx={{ color: comment.likes_count ? "#ed4337" : "#787a7a", padding: 0 }}
                                                                >
                                                                    {comment.liked_by_user ? (
                                                                        <Favorite sx={{ fontSize: "16px" }} />
                                                                    ) : (
                                                                        <FavoriteBorder sx={{ fontSize: "16px" }} />
                                                                    )}
                                                                </IconButton>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {comment.likes_count}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {post?.comments && post?.comments?.length > 3 && !showAllComments && (
                                            <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{ mt: 1, cursor: "pointer", mb: 1, textAlign: "center" }}
                                                onClick={() => setShowAllComments(true)}
                                            >
                                                View all {post?.comments.length} comments
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </CardContent>
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
            <Dialog
                open={commentOptionsDialogOpen}
                onClose={handleCloseDialog}
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
                    onClick={() => setConfirmDeleteButtonVisibile(true)}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                        borderBottom: "1px solid #505050",
                    }}
                >
                    Delete Comment
                </Button>
                <Button
                    fullWidth
                    onClick={() => {
                        handleDeleteComment();
                        setCommentOptionsDialog(false);
                    }}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#ed4337",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#ed4337" },
                        borderBottom: "1px solid #505050",
                        display: confirmDeleteButtonVisibile ? "block" : "none",
                    }}
                >
                    Confirm Delete Comment
                </Button>
                <Button
                    fullWidth
                    onClick={handleCloseCommentOptionsDialog}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                    }}
                >
                    Cancel
                </Button>
            </Dialog>
            <ImageDialog openDialog={openImageDialog} handleCloseDialog={handleCloseDialog} selectedImage={post?.file_url || ""} />
            <Popover
                open={Boolean(emojiAnchorEl)}
                anchorEl={emojiAnchorEl}
                onClose={() => setEmojiAnchorEl(null)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                    },
                }}
            >
                <EmojiPicker theme={Theme.AUTO} onEmojiClick={handleEmojiClick} />
            </Popover>
        </Card>
    );
};

export default ModalPost;
