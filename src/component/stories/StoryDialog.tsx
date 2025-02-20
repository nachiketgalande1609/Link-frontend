import { Dialog, DialogContent, Container, Box, IconButton, CircularProgress, LinearProgress } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { useState, useEffect } from "react";

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

    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
            setProgress(0);
        }
    }, [open, initialIndex]);

    useEffect(() => {
        if (open && stories.length > 0) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
            }, STORY_DURATION / 50);

            const timer = setTimeout(() => {
                if (currentIndex < stories.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                } else {
                    onClose();
                }
            }, STORY_DURATION);

            return () => {
                setProgress(0);
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
    }, [open, currentIndex, stories.length, onClose]);

    if (!stories.length || !stories[currentIndex]) {
        return (
            <Dialog fullScreen open={open} onClose={onClose}>
                <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "black", padding: 2 }}>
                    <CircularProgress color="primary" />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
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
                    <IconButton sx={{ position: "absolute", top: 20, right: 20, color: "white" }} onClick={onClose}>
                        <Close />
                    </IconButton>

                    {/* Previous Story Button */}
                    {currentIndex > 0 && (
                        <IconButton sx={{ position: "absolute", left: 20, color: "white" }} onClick={() => setCurrentIndex(currentIndex - 1)}>
                            <ArrowBackIos />
                        </IconButton>
                    )}

                    {/* Next Story Button */}
                    {currentIndex < stories.length - 1 && (
                        <IconButton sx={{ position: "absolute", right: 20, color: "white" }} onClick={() => setCurrentIndex(currentIndex + 1)}>
                            <ArrowForwardIos />
                        </IconButton>
                    )}
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default StoryDialog;
