import React from "react";
import { Card, CardContent, Box, CardMedia, Typography } from "@mui/material";
import { FavoriteBorder as ThumbUpIcon, ChatBubbleOutline as CommentIcon } from "@mui/icons-material";
interface PostProps {
    imageUrl?: string;
    like_count: number;
    comment_count: number;
}

const ProfilePagePost: React.FC<PostProps> = ({ imageUrl, like_count, comment_count }) => {
    return (
        <Card sx={{ borderRadius: "20px", position: "relative" }}>
            <CardContent sx={{ padding: "0 !important" }}>
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

            {/* Overlay Banner */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ThumbUpIcon sx={{ color: "white", mr: 1 }} />
                    <Typography sx={{ color: "white", fontWeight: "100" }}>{like_count}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CommentIcon sx={{ color: "white", mr: 1 }} />
                    <Typography sx={{ color: "white", fontWeight: "100" }}>{comment_count}</Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default ProfilePagePost;
