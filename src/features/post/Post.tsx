import React from "react";
import { Card, CardContent, Typography, CardActions, IconButton, Divider, Avatar, Grid, Box } from "@mui/material";
import { ThumbUp, Comment, Delete } from "@mui/icons-material";

interface PostProps {
    username: string;
    content: string;
    likes: number;
    comments: number;
    avatarUrl?: string;
}

const Post: React.FC<PostProps> = ({ username, content, likes, comments, avatarUrl }) => {
    const handleLike = () => {
        console.log("Liked the post");
    };

    const handleComment = () => {
        console.log("Comment on the post");
    };

    const handleDelete = () => {
        console.log("Deleted the post");
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item>
                        <Avatar src={avatarUrl} alt={username} sx={{ width: 40, height: 40 }} />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h6">{username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            2 hours ago
                        </Typography>
                    </Grid>
                </Grid>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {content}
                </Typography>
            </CardContent>

            <Divider />

            <CardActions sx={{ justifyContent: "space-between" }}>
                <Box>
                    <IconButton color="primary" onClick={handleLike}>
                        <ThumbUp />
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {likes} Likes
                    </Typography>
                    <IconButton color="primary" onClick={handleComment}>
                        <Comment />
                    </IconButton>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                        {comments} Comments
                    </Typography>
                </Box>

                <IconButton color="secondary" onClick={handleDelete}>
                    <Delete />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default Post;
