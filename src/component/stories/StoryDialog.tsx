import { Dialog, DialogContent, Container, Box, IconButton, LinearProgress, Avatar, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";

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
    stories: UserStories[]; // Grouped by user
    selectedStoryIndex: number;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryDialog: React.FC<StoryDialogProps> = ({ open, onClose, stories, selectedStoryIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const [selectedUserStories, setSelectedUserStories] = useState<Story[]>([]);

    useEffect(() => {
        if (open && stories.length) {
            const userStories = stories[selectedStoryIndex]?.stories || [];
            setSelectedUserStories(userStories);
            setCurrentIndex(0);
        }
    }, [open, selectedStoryIndex, stories]);

    useEffect(() => {
        if (!open || !selectedUserStories.length) return;

        setProgress(0);

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
    }, [currentIndex, open, selectedUserStories.length]);

    const handleClose = () => {
        setProgress(0);
        onClose();
    };

    if (!selectedUserStories.length || !selectedUserStories[currentIndex]) {
        return null;
    }

    const handleNext = () => {
        setProgress(0);
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 0);
    };

    const handlePrev = () => {
        setProgress(0);
        setTimeout(() => setCurrentIndex((prev) => prev - 1), 0);
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
                        }}
                    >
                        <Avatar src={stories[selectedStoryIndex].profile_picture} />
                        <Typography color="white" sx={{ fontSize: "0.85rem" }}>
                            {stories[selectedStoryIndex].username}
                        </Typography>
                    </Box>

                    {/* Progress Bars (Split based on number of stories) */}
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
                            src={selectedUserStories[currentIndex].media_url}
                            alt="Story"
                            sx={{ maxHeight: "90vh", maxWidth: "100%", objectFit: "contain" }}
                        />
                    ) : (
                        <Box
                            component="video"
                            src={selectedUserStories[currentIndex].media_url}
                            autoPlay
                            controls
                            sx={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain" }}
                        />
                    )}

                    {/* Close Button */}
                    <IconButton sx={{ position: "absolute", top: 20, right: 20, color: "white" }} onClick={handleClose}>
                        <Close />
                    </IconButton>

                    {/* Previous Story Button */}
                    {currentIndex > 0 && (
                        <IconButton sx={{ position: "absolute", left: 20, color: "white" }} onClick={handlePrev}>
                            <ArrowBackIos />
                        </IconButton>
                    )}

                    {/* Next Story Button */}
                    {currentIndex < selectedUserStories.length - 1 && (
                        <IconButton sx={{ position: "absolute", right: 20, color: "white" }} onClick={handleNext}>
                            <ArrowForwardIos />
                        </IconButton>
                    )}
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default StoryDialog;
