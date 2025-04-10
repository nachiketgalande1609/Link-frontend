import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Backdrop, Fade, IconButton, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { uploadStory } from "../../services/api"; // Import the API function

interface UploadStoryDialogProps {
    open: boolean;
    onClose: () => void;
    fetchStories: () => Promise<void>;
}

const UploadStoryDialog: React.FC<UploadStoryDialogProps> = ({ open, onClose, fetchStories }) => {
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const [media, setMedia] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setMedia(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"], "video/*": [".mp4", ".mov", ".avi"] },
        multiple: false,
    });

    const handleUpload = async () => {
        if (!media || !currentUser) return;
        setLoading(true);

        try {
            const response = await uploadStory({
                user_id: currentUser.id,
                caption,
                media,
            });
            if (response?.success) {
                setMedia(null);
                setCaption("");
                onClose();
                fetchStories();
            }
        } catch (error) {
            console.error("Failed to upload story:", error);
            alert("Error uploading story. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Function to check file type
    const isVideo = media ? media.type.startsWith("video") : false;
    const isImage = media ? media.type.startsWith("image") : false;

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
            <Fade in={open}>
                <Box
                    sx={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: "60px 20px 20px 20px",
                        borderRadius: "20px",
                        width: "80%",
                        maxWidth: "600px",
                        position: "relative",
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "grey.600",
                        }}
                    >
                        <Close />
                    </IconButton>

                    {/* Drag and Drop Media Upload */}
                    <Box
                        {...getRootProps()}
                        sx={{
                            border: "2px dashed gray",
                            borderRadius: "20px",
                            padding: 0,
                            textAlign: "center",
                            cursor: "pointer",
                            marginBottom: 2,
                            height: "300px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <input {...getInputProps()} />
                        {media ? (
                            isVideo ? (
                                <video
                                    src={URL.createObjectURL(media)}
                                    controls
                                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "20px" }}
                                />
                            ) : isImage ? (
                                <img
                                    src={URL.createObjectURL(media)}
                                    alt="Story Preview"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "20px" }}
                                />
                            ) : (
                                <Typography>Unsupported file format</Typography>
                            )
                        ) : (
                            <Typography>Drag & drop an image/video, or click to select</Typography>
                        )}
                    </Box>

                    {/* Caption Input */}
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        label="Write a caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        sx={{ marginBottom: 2, "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
                    />

                    {/* Upload Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => {
                            handleUpload();
                        }}
                        disabled={!media || loading}
                        sx={{ borderRadius: "15px", height: "45px" }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Upload Story"}
                    </Button>
                </Box>
            </Fade>
        </Modal>
    );
};

export default UploadStoryDialog;
