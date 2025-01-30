import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    IconButton,
    Divider,
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
} from "@mui/material";
import { Favorite, Comment, MoreVert } from "@mui/icons-material";
import { deletePost, likePost, addComment } from "../../services/api";

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
    }>;
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
}) => {
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(comments);
    const [postComments, setPostComments] = useState(initialComments);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(hasUserLikedPost);

    const currentUser = JSON.parse(localStorage.getItem("user") || "");

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
                        commenter_username: username,
                        commenter_profile_picture: currentUser.profile_picture_url,
                    };
                    setPostComments([...postComments, newComment]);
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

    // Open the confirmation dialog
    const handleDeleteClick = () => {
        setDialogOpen(true);
        handleMenuClose(); // Close the menu
    };

    // Close the confirmation dialog without deleting
    const handleCancel = () => {
        setDialogOpen(false);
    };

    return (
        <Card sx={{ mb: 3, borderRadius: "20px" }}>
            <CardContent sx={{ padding: 0 }}>
                <Box sx={{ padding: "16px" }}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Avatar src={avatarUrl || "https://via.placeholder.com/40"} alt={username} sx={{ width: 40, height: 40 }} />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6">{username}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {timeAgo}
                            </Typography>
                        </Grid>
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
                                <MenuItem sx={{ height: "40px", borderRadius: "15px" }}>Edit</MenuItem>
                                <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleDeleteClick}>
                                    Delete
                                </MenuItem>
                            </Menu>
                        </Grid>
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

                <Typography variant="body1" sx={{ mt: 2, padding: "16px", margin: 0 }}>
                    <span style={{ fontWeight: "bold", marginRight: "8px" }}>{username}</span>
                    {content}
                </Typography>
            </CardContent>

            <Divider />

            <CardActions sx={{ justifyContent: "space-between", height: "60px", padding: "8px" }}>
                <Box>
                    <IconButton onClick={handleLike} sx={{ color: isLiked ? "red" : "white" }}>
                        <Favorite />
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {likes} Likes
                    </Typography>
                    <IconButton color="primary" sx={{ color: "white" }}>
                        <Comment />
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {commentCount} Comments
                    </Typography>
                </Box>
            </CardActions>

            <Box sx={{ padding: "0 16px 16px 16px" }}>
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
                            borderRadius: "8px",
                        },
                    }}
                />

                {postComments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No comments yet
                    </Typography>
                ) : (
                    postComments.map((comment) => (
                        <Box key={comment.id} sx={{ mb: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <Avatar src={comment.commenter_profile_picture} alt={comment.commenter_username} sx={{ width: 30, height: 30 }} />
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="body2" color="text.primary">
                                        <strong>{comment.commenter_username}:</strong> {comment.content}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ))
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
