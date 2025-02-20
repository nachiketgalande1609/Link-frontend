import { Dialog, DialogContent, Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { useState, useEffect } from "react";

interface StoryDialogProps {
    open: boolean;
    onClose: () => void;
    stories: { id: number; image: string }[];
}

const StoryDialog: React.FC<StoryDialogProps> = ({ open, onClose, stories }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                if (currentIndex < stories.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    onClose(); // Close dialog after last story
                }
            }, 5000); // 5s per story
            return () => clearTimeout(timer);
        }
    }, [open, currentIndex, stories, onClose]);

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
                <Box
                    component="img"
                    src={stories[currentIndex].image}
                    alt="Story"
                    sx={{ maxHeight: "100vh", maxWidth: "100vw", objectFit: "contain" }}
                />
                <IconButton sx={{ position: "absolute", top: 20, right: 20, color: "white" }} onClick={onClose}>
                    <Close />
                </IconButton>
                {currentIndex > 0 && (
                    <IconButton sx={{ position: "absolute", left: 20, color: "white" }} onClick={() => setCurrentIndex(currentIndex - 1)}>
                        <ArrowBackIos />
                    </IconButton>
                )}
                {currentIndex < stories.length - 1 && (
                    <IconButton sx={{ position: "absolute", right: 20, color: "white" }} onClick={() => setCurrentIndex(currentIndex + 1)}>
                        <ArrowForwardIos />
                    </IconButton>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StoryDialog;
