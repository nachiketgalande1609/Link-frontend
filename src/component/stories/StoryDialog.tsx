import { Dialog, DialogContent, Container, Box, IconButton, LinearProgress, Avatar, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Story {
    id: number;
    media_url: string;
    media_type: "image" | "video";
}

interface UserStories {
    user_id: number;
    username: string;
    profile_picture: string;
    stories: Story[];
}

interface StoryDialogProps {
    open: boolean;
    onClose: () => void;
    stories: UserStories[];
    selectedStoryIndex: number;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryDialog: React.FC<StoryDialogProps> = ({ open, onClose, stories, selectedStoryIndex }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const [selectedUserStories, setSelectedUserStories] = useState<Story[]>([]);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);

    // Handle user story change
    useEffect(() => {
        if (open && stories.length) {
            const newStories = stories[selectedStoryIndex]?.stories || [];

            // Reset states before updating stories
            setCurrentIndex(0);
            setIsMediaLoaded(false);
            setSelectedUserStories(newStories);
        }
    }, [open, selectedStoryIndex, stories]);

    // Preload media
    useEffect(() => {
        if (!open || !selectedUserStories.length) return;

        setProgress(0);
        setIsMediaLoaded(false);

        const currentStory = selectedUserStories[currentIndex];

        if (currentStory.media_type === "image") {
            const img = new Image();
            img.src = currentStory.media_url;
            img.onload = () => setIsMediaLoaded(true);
        } else {
            setIsMediaLoaded(true);
        }
    }, [currentIndex, open, selectedUserStories]);

    // Start story timer after media is loaded
    useEffect(() => {
        if (!open || !isMediaLoaded) return;

        const startTime = performance.now();

        const updateProgress = () => {
            const elapsed = performance.now() - startTime;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress < 100) {
                animationFrameRef.current = requestAnimationFrame(updateProgress);
            } else {
                if (currentIndex < selectedUserStories.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                } else {
                    handleClose();
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(updateProgress);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentIndex, open, isMediaLoaded]);

    const handleClose = () => {
        setProgress(0);
        onClose();
    };

    if (!selectedUserStories.length || !selectedUserStories[currentIndex]) {
        return null;
    }

    const handleNext = () => {
        if (currentIndex < selectedUserStories.length - 1) {
            setProgress(0);
            setIsMediaLoaded(false);
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setProgress(0);
            setIsMediaLoaded(false);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogContent sx={{ backgroundColor: "black", padding: 0 }}>
                <Container
                    maxWidth="xs"
                    sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                        width: "100vw",
                        padding: "0 !important",
                    }}
                >
                    {/* Profile Info */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 30,
                            left: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            navigate(`/profile/${stories[selectedStoryIndex].user_id}`);
                        }}
                    >
                        <Avatar src={stories[selectedStoryIndex].profile_picture} />
                        <Typography color="white" sx={{ fontSize: "0.85rem" }}>
                            {stories[selectedStoryIndex].username}
                        </Typography>
                    </Box>

                    {/* Progress Bars */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            right: 10,
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        {selectedUserStories.map((_, idx) => (
                            <LinearProgress
                                key={idx}
                                variant="determinate"
                                value={idx < currentIndex ? 100 : idx === currentIndex ? progress : 0}
                                sx={{
                                    flex: 1,
                                    height: 2,
                                    borderRadius: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "white",
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    {/* Story Media */}
                    {selectedUserStories[currentIndex].media_type === "image" ? (
                        <Box
                            component="img"
                            key={selectedUserStories[currentIndex].id} // Force re-render
                            src={selectedUserStories[currentIndex].media_url}
                            alt="Story"
                            onLoad={() => setIsMediaLoaded(true)}
                            sx={{ maxHeight: "90vh", maxWidth: "100%", objectFit: "contain", display: isMediaLoaded ? "block" : "none" }}
                        />
                    ) : (
                        <Box
                            component="video"
                            key={selectedUserStories[currentIndex].id} // Force re-render
                            src={selectedUserStories[currentIndex].media_url}
                            autoPlay
                            controls
                            onCanPlay={() => setIsMediaLoaded(true)}
                            sx={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", display: isMediaLoaded ? "block" : "none" }}
                        />
                    )}

                    {/* Close Button */}
                    <IconButton sx={{ position: "absolute", top: 20, right: 20, color: "white" }} onClick={handleClose}>
                        <Close />
                    </IconButton>

                    {/* Previous Story Button */}
                    {/* Previous Story Button */}
                    {currentIndex > 0 && (
                        <IconButton
                            sx={{
                                position: "absolute",
                                left: -50, // Move outside the story container
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "white",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                                width: 48,
                                height: 48,
                            }}
                            onClick={handlePrev}
                        >
                            <ArrowBackIos sx={{ color: "#555555" }} />
                        </IconButton>
                    )}

                    {/* Next Story Button */}
                    {currentIndex < selectedUserStories.length - 1 && (
                        <IconButton
                            sx={{
                                position: "absolute",
                                right: -50, // Move outside the story container
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "white",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "transparent" },
                                width: 48,
                                height: 48,
                            }}
                            onClick={handleNext}
                        >
                            <ArrowForwardIos sx={{ color: "#555555" }} />
                        </IconButton>
                    )}
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default StoryDialog;
