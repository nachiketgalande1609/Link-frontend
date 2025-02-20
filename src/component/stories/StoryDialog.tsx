import { Dialog, DialogContent, Container, Box, IconButton, LinearProgress } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";

interface Story {
    id: number;
    media_url: string;
    media_type: "image" | "video";
}

interface StoryDialogProps {
    open: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex?: number;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryDialog: React.FC<StoryDialogProps> = ({ open, onClose, stories, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!open || !stories.length) return;

        setCurrentIndex(initialIndex);
        setProgress(0);
    }, [open, initialIndex, stories.length]);

    useEffect(() => {
        if (!open || !stories.length) return;

        setProgress(0);

        const startTime = performance.now();

        const updateProgress = () => {
            const elapsed = performance.now() - startTime;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress < 100) {
                animationFrameRef.current = requestAnimationFrame(updateProgress);
            } else {
                if (currentIndex < stories.length - 1) {
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
    }, [currentIndex, open, stories.length]);

    const handleClose = () => {
        setProgress(0); // Reset progress when dialog closes
        onClose();
    };

    if (!stories.length || !stories[currentIndex]) {
        return null;
    }

    const handleNext = () => {
        setProgress(0); // Instantly reset progress
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 0); // Ensure re-render before increment
    };

    const handlePrev = () => {
        setProgress(0); // Instantly reset progress
        setTimeout(() => setCurrentIndex((prev) => prev - 1), 0);
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogContent sx={{ backgroundColor: "black", padding: 0 }}>
                <Container
                    maxWidth="sm"
                    sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        width: "100vw",
                        padding: 0,
                    }}
                >
                    {/* Progress Bar */}
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ position: "absolute", top: 10, left: 10, right: 10, height: 4, borderRadius: 2 }}
                    />

                    {stories[currentIndex].media_type === "image" ? (
                        <Box
                            component="img"
                            src={stories[currentIndex].media_url}
                            alt="Story"
                            sx={{ maxHeight: "90vh", maxWidth: "100%", objectFit: "contain" }}
                        />
                    ) : (
                        <Box
                            component="video"
                            src={stories[currentIndex].media_url}
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
                    {currentIndex < stories.length - 1 && (
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
