import React from "react";
import { Card, CardContent, Box, CardMedia } from "@mui/material";
interface PostProps {
    imageUrl?: string;
}

const ProfilePagePost: React.FC<PostProps> = ({ imageUrl }) => {
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
        </Card>
    );
};

export default ProfilePagePost;
