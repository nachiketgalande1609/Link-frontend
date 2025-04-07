import React, { useState } from "react";
import { Card, CardContent, Box, CardMedia, CircularProgress } from "@mui/material";

interface PostProps {
    fileUrl?: string;
}

const ProfilePagePost: React.FC<PostProps> = ({ fileUrl }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    };

    return (
        <Card sx={{ borderRadius: "10px", position: "relative" }}>
            <CardContent sx={{ padding: "0 !important" }}>
                {fileUrl && (
                    <Box sx={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden" }}>
                        {/* Blurred placeholder that shows while loading */}
                        {isImageLoading && (
                            <CardMedia
                                component="img"
                                image={fileUrl}
                                alt="Post Image Loading"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    filter: "blur(20px)",
                                    transform: "scale(1.1)",
                                }}
                            />
                        )}

                        {/* Loading spinner */}
                        {isImageLoading && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 2,
                                }}
                            >
                                <CircularProgress color="inherit" size={24} />
                            </Box>
                        )}

                        {/* Actual image */}
                        <CardMedia
                            component="img"
                            image={fileUrl}
                            alt="Post Image"
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "opacity 0.3s ease",
                                opacity: isImageLoading ? 0 : 1,
                            }}
                            onLoad={handleImageLoad}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfilePagePost;
