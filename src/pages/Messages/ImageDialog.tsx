import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

interface DialogProps {
    openDialog: boolean;
    handleCloseDialog: () => void;
    selectedImage: string;
}

const ImageDialog: React.FC<DialogProps> = ({ openDialog, handleCloseDialog, selectedImage }) => {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = selectedImage;
        link.download = "image.jpg"; // You can modify the file name
        link.click();
    };

    return (
        <Dialog open={openDialog} onClose={handleCloseDialog} sx={{ "& .MuiPaper-root": { borderRadius: "10px" } }}>
            <DialogContent sx={{ display: "flex", justifyContent: "center", padding: 0, position: "relative" }}>
                <img
                    src={selectedImage}
                    alt="Clicked"
                    style={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
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
