import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Backdrop, Fade, IconButton, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { createPost } from "../../services/api";
import { useGlobalStore } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { LocationOn } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";

interface CreatePostModalProps {
    open: boolean;
    handleClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, handleClose }) => {
    const navigate = useNavigate();
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const [postContent, setPostContent] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [location, setLocation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const { user, setPostUploading } = useGlobalStore();

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setImageFile(acceptedFiles[0]);
        }
    };

    const handleModalClose = () => {
        setImageFile(null);
        setPostContent("");
        setLocation("");
        handleClose();
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
        multiple: false,
    });

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setPostUploading(true);
            navigate(`/profile/${currentUser?.id}`);

            if (postContent.trim() && user) {
                const res = await createPost({
                    user_id: user.id,
                    content: postContent,
                    image: imageFile || undefined,
                    location,
                });

                if (res?.success) {
                    handleModalClose();
                }
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setLoading(false);
            setPostUploading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                },
            }}
        >
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
                        width: "90%",
                        maxWidth: "900px",
                        position: "relative",
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={handleModalClose}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "grey.600",
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                        {/* Left: Dropzone */}
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: "1.5px dashed gray",
                                borderRadius: "20px",
                                flex: 1,
                                minHeight: 400,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                overflow: "hidden",
                            }}
                        >
                            <input {...getInputProps()} />
                            {imageFile ? (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        borderRadius: "20px",
                                    }}
                                />
                            ) : (
                                <Typography>Drag & drop an image, or click to select one</Typography>
                            )}
                        </Box>

                        {/* Right: Inputs */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                variant="outlined"
                                placeholder="Write a caption"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                sx={{
                                    marginBottom: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                        "&:hover fieldset": {
                                            borderColor: "#767676",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#767676",
                                            boxShadow: "none",
                                        },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                sx={{
                                    marginBottom: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                        "&:hover fieldset": {
                                            borderColor: "#767676",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#767676",
                                            boxShadow: "none",
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOn color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={!postContent.trim()}
                                sx={{
                                    borderRadius: "15px",
                                    height: "45px",
                                    mt: "auto",
                                    backgroundColor: "#ffffff",
                                    ":disabled": {
                                        backgroundColor: "#202327",
                                        color: "#000000",
                                    },
                                    animation: !postContent.trim() ? "" : "buttonEnabledAnimation 0.6s ease-out",
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Post"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CreatePostModal;
