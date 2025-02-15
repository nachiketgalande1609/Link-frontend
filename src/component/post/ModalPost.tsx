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
import { deletePost, likePost, addComment, updatePost } from "../../services/api";

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
    isMobile: boolean;
}

const ModalPost: React.FC<PostProps> = ({
    username,
    content,
    likes: initialLikes,
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
    isMobile,
}) => {
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(comments);
    const [postComments, setPostComments] = useState(initialComments);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(hasUserLikedPost);
    const [likes, setLikes] = useState(initialLikes);

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
            setIsLiked((prevIsLiked) => {
                setLikes((prevLikes) => (prevIsLiked ? prevLikes - 1 : prevLikes + 1));
                return !prevIsLiked;
            });
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

    const handleEditClick = () => {
        setIsEditing(true);
        handleMenuClose();
    };

    const handleCancel = () => {
        setDialogOpen(false);
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
                            {fileUrl && (
                                <CardMedia
                                    component="img"
                                    image={fileUrl}
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
                            <Box sx={{ padding: isMobile ? "0 10px 10px 10px" : "20px" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        src={avatarUrl || "https://via.placeholder.com/40"}
                                        alt={username}
                                        sx={{ width: isMobile ? 42 : 52, height: isMobile ? 42 : 52 }}
                                    />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography sx={{ fontSize: isMobile ? "0.85rem" : "1rem" }}>{username}</Typography>
                                        <Typography sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} color="text.secondary">
                                            {timeAgo}
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
                                )}

                                {currentUser?.id && isEditing ? (
                                    <Box sx={{ mt: 2 }}>
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
                                            <Button onClick={handleSaveEdit} variant="contained" color="primary" sx={{ borderRadius: "15px" }}>
                                                Save
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography sx={{ mt: 2, fontSize: isMobile ? "0.85rem" : "1rem" }}>{content}</Typography>
                                )}

                                <Box sx={{ mt: 2 }}>
                                    {currentUser?.id && (
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
                                    )}

                                    {visibleComments.length === 0 ? (
                                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No comments yet
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                maxHeight: "50vh",
                                                overflowY: "auto",
                                                paddingRight: 2,
                                            }}
                                        >
                                            {visibleComments.map((comment) => (
                                                <Box key={comment.id} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Avatar
                                                            src={comment.commenter_profile_picture}
                                                            alt={comment.commenter_username}
                                                            sx={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40 }}
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
                                            ))}
                                        </Box>
                                    )}

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
                    <Button onClick={handleCancel} size="large" sx={{ color: "#ffffff", borderRadius: "15px" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} size="large" variant="contained" color="error" sx={{ borderRadius: "15px" }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default ModalPost;
