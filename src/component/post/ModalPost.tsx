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
} from "@mui/material";
import { FavoriteBorder, Favorite, ChatBubbleOutline, MoreVert } from "@mui/icons-material";
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
        timeAgo: string;
    }>;
    borderRadius: string;
}

const ModalPost: React.FC<PostProps> = ({
    username,
    content,
    likes: initialLikes,
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
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(comments);
    const [postComments, setPostComments] = useState(initialComments);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(hasUserLikedPost);
    const [likes, setLikes] = useState(initialLikes);

    const currentUser = JSON.parse(localStorage.getItem("user") || "");

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
            setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
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
                    padding: 0,
                }}
            >
                <Box sx={{}}>
                    <Grid container spacing={2}>
                        {/* Left column for image */}
                        <Grid item xs={12} sm={6}>
                            {imageUrl && (
                                <CardMedia
                                    component="img"
                                    image={imageUrl}
                                    alt="Post Image"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            )}
                        </Grid>

                        {/* Right column for post details */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ padding: "20px" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar src={avatarUrl || "https://via.placeholder.com/40"} alt={username} sx={{ width: 52, height: 52 }} />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="h6">{username}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {timeAgo}
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={handleMenuOpen} sx={{ ml: "auto" }}>
                                        <MoreVert />
                                    </IconButton>
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
                                    <MenuItem sx={{ height: "40px", borderRadius: "15px" }}>Edit</MenuItem>
                                    <MenuItem sx={{ height: "40px", borderRadius: "15px" }} onClick={handleDeleteClick}>
                                        Delete
                                    </MenuItem>
                                </Menu>

                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    {content}
                                </Typography>

                                <CardActions
                                    sx={{
                                        justifyContent: "space-between",
                                        marginTop: "16px",
                                        padding: 0,
                                    }}
                                >
                                    <Box>
                                        <IconButton onClick={handleLike} sx={{ color: isLiked ? "red" : "white", padding: "0" }}>
                                            {isLiked ? (
                                                <Favorite sx={{ fontSize: "30px", mr: 1 }} />
                                            ) : (
                                                <FavoriteBorder sx={{ fontSize: "30px", mr: 1 }} />
                                            )}
                                        </IconButton>
                                        <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                                            {likes}
                                        </Typography>
                                        <IconButton onClick={handleFocusCommentField} sx={{ color: "#ffffff", padding: "0" }}>
                                            <ChatBubbleOutline sx={{ fontSize: "30px", mr: 1 }} />
                                        </IconButton>
                                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                                            {commentCount}
                                        </Typography>
                                    </Box>
                                </CardActions>

                                <Box sx={{ mt: 2 }}>
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
                                        inputRef={commentInputRef}
                                    />

                                    <Box
                                        sx={{
                                            maxHeight: "50vh",
                                            overflowY: "auto",
                                            paddingRight: 2,
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
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                        <Box sx={{ ml: 2, display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                            <Typography variant="body2" color="text.primary">
                                                                <strong style={{ fontWeight: "bold", marginRight: "4px" }}>
                                                                    {comment.commenter_username}
                                                                </strong>
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
                                    </Box>

                                    {postComments.length > 3 && !showAllComments && (
                                        <Typography
                                            variant="body2"
                                            color="primary"
                                            sx={{ mt: 1, cursor: "pointer", mb: 1 }}
                                            onClick={() => setShowAllComments(true)}
                                        >
                                            View all {postComments.length} comments
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
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

export default ModalPost;
