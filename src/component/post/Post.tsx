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
    Menu,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { FavoriteBorder, Favorite, ChatBubbleOutline, MoreVert } from "@mui/icons-material";
import { deletePost, likePost, addComment, updatePost } from "../../services/api"; // Assuming you have an updatePost function in your API

interface PostProps {
    username: string;
    content: string;
    likes: number;
    comments: number;
    avatarUrl?: string;
    imageUrl?: string;
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
}

const Post: React.FC<PostProps> = ({
    username,
    content,
    likes,
    comments,
    avatarUrl,
    imageUrl,
    timeAgo,
    postId,
    userId,
    fetchPosts,
    hasUserLikedPost,
    initialComments,
    borderRadius,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(comments);
    const [postComments, setPostComments] = useState(initialComments);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(hasUserLikedPost);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const [showAllComments, setShowAllComments] = useState(false);

    const visibleComments = showAllComments ? postComments : postComments.slice(0, 2);

    const commentInputRef = useRef<HTMLInputElement>(null);

    const handleFocusCommentField = () => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
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

    const handleCancel = () => {
        setDialogOpen(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        handleMenuClose();
    };

    const handleSaveEdit = async () => {
        try {
            const response = await updatePost(postId, editedContent);
            if (response?.success) {
                setIsEditing(false);
                fetchPosts();
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    return (
        <Card sx={{ borderRadius: isMobile ? 0 : borderRadius }}>
            <CardContent sx={{ padding: 0, backgroundColor: isMobile ? "#000000" : "#101114" }}>
                <Box sx={{ padding: isMobile ? "14px" : "16px" }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Avatar */}
                        <Grid item>
                            <Avatar
                                src={avatarUrl || "https://via.placeholder.com/40"}
                                alt={username}
                                sx={{ width: isMobile ? 42 : 52, height: isMobile ? 42 : 52 }}
                            />
                        </Grid>

                        {/* Username */}
                        <Grid item xs zeroMinWidth>
                            <Typography
                                sx={{ fontSize: isMobile ? "0.85rem" : "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                                {username}
                            </Typography>
                        </Grid>

                        {/* More Options (Only for post owner) */}
                        {currentUser?.id === userId && (
                            <Grid item>
                                <IconButton onClick={handleMenuOpen}>
                                    <MoreVert />
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
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {imageUrl && (
                    <Box sx={{ position: "relative", width: "100%", paddingTop: "100%" }}>
                        <CardMedia
                            component="img"
                            image={imageUrl}
                            alt="Post Image"
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                )}
            </CardContent>

            <CardActions
                sx={{ justifyContent: "space-between", height: "60px", padding: "0px 8px", backgroundColor: isMobile ? "#000000" : "#101114" }}
            >
                <Box>
                    <IconButton onClick={handleLike} sx={{ color: isLiked ? "red" : "white" }}>
                        {isLiked ? <Favorite sx={{ fontSize: "30px" }} /> : <FavoriteBorder sx={{ fontSize: "30px" }} />}
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {likes}
                    </Typography>
                    <IconButton sx={{ color: "#ffffff" }} onClick={handleFocusCommentField}>
                        <ChatBubbleOutline sx={{ fontSize: "30px" }} />
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {commentCount}
                    </Typography>
                </Box>
            </CardActions>

            {isEditing ? (
                <Box sx={{ mt: 2, padding: "0px 16px 16px 16px", margin: 0 }}>
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
                    {/* Buttons aligned to the right */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button onClick={() => setIsEditing(false)} variant="outlined" sx={{ borderRadius: "20px" }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} variant="contained" color="primary" sx={{ borderRadius: "20px" }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Typography
                    sx={{
                        fontSize: isMobile ? "0.85rem" : "1rem",
                        mt: 2,
                        padding: "0px 16px 16px 16px",
                        margin: 0,
                        backgroundColor: isMobile ? "#000000" : "#101114",
                    }}
                >
                    <span style={{ fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "bold", marginRight: "8px" }}>{username}</span>
                    {content}
                </Typography>
            )}

            <Box sx={{ padding: "0 16px 16px 16px", backgroundColor: isMobile ? "#000000" : "#101114" }}>
                <TextField
                    fullWidth
                    label="Add a comment..."
                    variant="outlined"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    sx={{
                        mb: "16px",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                        },
                    }}
                    inputRef={commentInputRef}
                />
                <Box
                    sx={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        paddingRight: 2,
                        "&::-webkit-scrollbar": {
                            width: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#202327",
                        },
                    }}
                >
                    {visibleComments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No comments yet
                        </Typography>
                    ) : (
                        visibleComments.map((comment) => (
                            <Box key={comment.id} sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        src={comment.commenter_profile_picture}
                                        alt={comment.commenter_username}
                                        sx={{ width: isMobile ? 35 : 40, height: isMobile ? 35 : 40 }}
                                    />
                                    <Box sx={{ ml: isMobile ? "10px" : "16px", display: "flex", justifyContent: "space-between", width: "100%" }}>
                                        <Typography variant="body2" color="text.primary">
                                            <strong style={{ fontWeight: "bold", marginRight: "4px" }}>{comment.commenter_username}</strong>
                                            {comment.content}
                                        </Typography>
                                        <Typography variant="caption" sx={{ ml: 2, color: "#666666" }}>
                                            {comment.timeAgo}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    )}
                    {postComments.length > 3 && !showAllComments && (
                        <Typography
                            variant="body2"
                            color="primary"
                            sx={{ mt: 2, cursor: "pointer", textAlign: "center" }}
                            onClick={() => setShowAllComments(true)}
                        >
                            View all {postComments.length} comments
                        </Typography>
                    )}
                    <Typography sx={{ fontSize: "0.8rem", mt: 2, color: "#666666" }}>{timeAgo}</Typography>
                </Box>
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
                    <Button onClick={handleCancel} size="large" sx={{ color: "#ffffff" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} size="large" variant="contained" color="error" sx={{ borderRadius: "12px" }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default Post;
