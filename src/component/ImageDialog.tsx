import React, { useState } from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

interface DialogProps {
    openDialog: boolean;
    handleCloseDialog: () => void;
    selectedImage: string;
}

const ImageDialog: React.FC<DialogProps> = ({ openDialog, handleCloseDialog, selectedImage }) => {
    const [scale, setScale] = useState(1);
    const [transformOrigin, setTransformOrigin] = useState("center center");

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = selectedImage;
        link.download = "image.jpg";
        link.click();
    };

    const handleWheel = (event: React.WheelEvent) => {
        event.preventDefault();

        // Get the mouse position relative to the image
        const image = event.currentTarget as HTMLImageElement;
        const mouseX = event.clientX - image.getBoundingClientRect().left;
        const mouseY = event.clientY - image.getBoundingClientRect().top;

        // Calculate the new scale value based on scroll direction
        setScale((prevScale) => {
            const newScale = event.deltaY < 0 ? prevScale * 1.1 : prevScale * 0.9;
            return Math.max(1, Math.min(newScale, 5)); // Restrict zoom between 1x and 5x
        });

        // Update the transform origin based on the mouse position
        const transformOriginX = (mouseX / image.offsetWidth) * 100;
        const transformOriginY = (mouseY / image.offsetHeight) * 100;
        setTransformOrigin(`${transformOriginX}% ${transformOriginY}%`);
    };

    return (
        <Dialog
            open={openDialog}
            maxWidth="lg"
            onClose={handleCloseDialog}
            sx={{ "& .MuiPaper-root": { borderRadius: "10px" } }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                },
            }}
        >
            <DialogContent
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                    position: "relative",
                    overflow: "hidden",
                }}
                onWheel={handleWheel}
            >
                <img
                    src={selectedImage}
                    alt="Clicked"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: transformOrigin,
                        transition: "transform 0.2s ease-out",
                        objectFit: "contain",
                        maxWidth: "100%",
                        maxHeight: "90vh",
                    }}
                />
                <IconButton
                    onClick={handleDownload}
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: "35px",
                        height: "35px",
                        color: "white",
                        backgroundColor: "rgb(0, 0, 0, 0.5)",
                        borderRadius: 2,
                        ":hover": {
                            backgroundColor: "rgb(0, 0, 0, 1)",
                        },
                    }}
                >
                    <DownloadIcon sx={{ fontSize: "18px" }} />
                </IconButton>
            </DialogContent>
        </Dialog>
    );
};

export default ImageDialog;
