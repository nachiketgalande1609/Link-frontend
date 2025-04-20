import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Backdrop, Fade, IconButton, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { uploadStory } from "../../services/api";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { SentimentSatisfiedAlt as EmojiIcon, Close } from "@mui/icons-material";
import Popover from "@mui/material/Popover";

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
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);

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

    const handleEmojiClick = (emojiData: any) => {
        setCaption((prev) => prev + emojiData.emoji);
    };

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
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={() => {
                            onClose();
                            setMedia(null);
                            setCaption("");
                        }}
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
                            width: "100%",
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
                    <Box sx={{ position: "relative", marginBottom: 2, width: "100%" }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            label="Write a caption"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            sx={{ marginBottom: 2, "& .MuiOutlinedInput-root": { borderRadius: "20px", paddingRight: "45px" } }}
                        />
                        <IconButton
                            onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                            sx={{
                                position: "absolute",
                                top: 10,
                                right: 8,
                                zIndex: 1,
                            }}
                        >
                            <EmojiIcon color="action" />
                        </IconButton>
                    </Box>
                    {/* Upload Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => {
                            handleUpload();
                        }}
                        disabled={!media || loading}
                        sx={{
                            borderRadius: loading ? "50px" : "15px",
                            backgroundColor: loading ? "#202327" : "#ffffff",
                            color: loading ? "transparent" : "#000000",
                            position: "relative",
                            overflow: "hidden",
                            height: "40px",
                            minWidth: loading ? "40px" : "auto",
                            width: loading ? "40px" : "100%",
                            transition: "all 0.4s cubic-bezier(0.65, 0, 0.35, 1)",
                            animation: !media || loading ? "" : "buttonEnabledAnimation 0.6s ease-out",
                        }}
                    >
                        {loading ? (
                            <CircularProgress
                                size={20}
                                thickness={5}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    marginTop: "-10px",
                                    marginLeft: "-10px",
                                    color: "#fff",
                                }}
                            />
                        ) : (
                            "Post"
                        )}
                    </Button>
                    <Popover
                        open={Boolean(emojiAnchorEl)}
                        anchorEl={emojiAnchorEl}
                        onClose={() => setEmojiAnchorEl(null)}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                        PaperProps={{
                            sx: {
                                borderRadius: "20px",
                            },
                        }}
                    >
                        <EmojiPicker theme={Theme.AUTO} onEmojiClick={handleEmojiClick} />
                    </Popover>
                </Box>
            </Fade>
        </Modal>
    );
};

export default UploadStoryDialog;
