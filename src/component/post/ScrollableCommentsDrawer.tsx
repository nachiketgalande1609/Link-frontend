import React, { useEffect, useState } from "react";
import { Typography, IconButton, Avatar, Box, TextField, SwipeableDrawer, useMediaQuery, useTheme, styled, Dialog, Button } from "@mui/material";
import { MoreHoriz, Send } from "@mui/icons-material";
import { grey } from "@mui/material/colors";

interface ScrollableCommentsDrawerProps {
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    postComments: Array<{
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
    handleComment: () => void;
    commentText: string;
    setCommentText: (text: string) => void;
    commentInputRef: React.RefObject<HTMLInputElement>;
    content: string;
    username: string;
    avatarUrl: string | undefined;
    setSelectedCommentId: (id: number | null) => void;
    handleDeleteComment: () => void;
}

export default function ScrollableCommentsDrawer({
    drawerOpen,
    setDrawerOpen,
    postComments,
    handleComment,
    commentText,
    setCommentText,
    commentInputRef,
    content,
    username,
    avatarUrl,
    setSelectedCommentId,
    handleDeleteComment,
}: ScrollableCommentsDrawerProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDeleteButtonVisibile, setConfirmDeleteButtonVisibile] = useState<boolean>(false);
    const [hoveredCommentId, setHoveredCommentId] = useState<number | null>(null);

    const handleOpenDialog = (commentId: number) => {
        setSelectedCommentId(commentId);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCommentId(null);
        setConfirmDeleteButtonVisibile(false);
    };

    // Focus input when drawer opens
    useEffect(() => {
        if (drawerOpen && commentInputRef.current) {
            setTimeout(() => commentInputRef.current?.focus(), 300); // Delay to allow animation to complete
        }
    }, [drawerOpen, commentInputRef]);

    const Puller = styled("div")(({ theme }) => ({
        width: 100,
        height: 6,
        backgroundColor: grey[300],
        borderRadius: 3,
        position: "absolute",
        top: 8,
        left: "calc(50% - 50px)",
        ...theme.applyStyles("dark", {
            backgroundColor: grey[900],
        }),
    }));

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onOpen={() => setDrawerOpen(true)}
            sx={{
                "& .MuiDrawer-paper": {
                    borderRadius: "20px 20px 0 0",
                    backgroundColor: "#0a0c10",
                    color: "white",
                    width: isMobile ? "100%" : "50%",
                    margin: isMobile ? 0 : "0 auto",
                    left: "0",
                    right: "0",
                    display: "flex",
                    flexDirection: "column",
                    height: "90vh",
                },
            }}
        >
            <Puller />

            <Typography sx={{ textAlign: "center", mt: 3, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Comments</Typography>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: isMobile ? "8px 8px 0 8px" : "16px 16px 0 16px",
                }}
            >
                <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
                    <Avatar src={avatarUrl} />
                    <Box
                        sx={{
                            padding: "8px",
                            borderRadius: "10px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                        }}
                    >
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: "500", color: "#cccccc" }}>{username}</Typography>
                        <Typography variant="body2">{content}</Typography>
                    </Box>
                </Box>

                {postComments.length === 0 ? (
                    <Typography color="gray" sx={{ textAlign: "center", mt: 2 }}>
                        No comments yet.
                    </Typography>
                ) : (
                    postComments.map((comment) => (
                        <Box
                            key={comment.id}
                            sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}
                            onMouseEnter={() => setHoveredCommentId(comment.id)}
                            onMouseLeave={() => setHoveredCommentId(null)}
                        >
                            <Avatar src={comment.commenter_profile_picture} />
                            <Box
                                sx={{
                                    backgroundColor: "#202327",
                                    padding: "8px",
                                    borderRadius: "10px",
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: "0.9rem", fontWeight: "500", color: "#aaaaaa" }}>
                                            {comment.commenter_username}
                                        </Typography>
                                        {hoveredCommentId === comment.id && comment.user_id === currentUser.id && (
                                            <IconButton onClick={() => handleOpenDialog(comment.id)} sx={{ color: "#aaaaaa", padding: 0 }}>
                                                <MoreHoriz sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="gray" sx={{ ml: "auto" }}>
                                        {comment.timeAgo}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "#ffffff", mt: 0.5 }}>
                                    {comment.content}
                                </Typography>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Fixed Input Box */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: isMobile ? "10px 8px" : "10px 16px",
                    backgroundColor: "#202327",
                    borderTop: "1px solid #505050",
                }}
            >
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Write a comment..."
                    value={commentText}
                    size={isMobile ? "small" : "medium"}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    sx={{
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
                    inputRef={commentInputRef}
                />
                <IconButton onClick={handleComment} sx={{ color: "white" }}>
                    <Send />
                </IconButton>
            </Box>
            <Dialog
                open={dialogOpen}
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
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
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
                        setDialogOpen(false);
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
                    onClick={handleCloseDialog}
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
        </SwipeableDrawer>
    );
}
