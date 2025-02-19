import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Backdrop, Fade, IconButton, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { createPost } from "../../services/api";
import { useGlobalStore } from "../../store/store";

interface CreatePostModalProps {
    open: boolean;
    handleClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, handleClose }) => {
    const [postContent, setPostContent] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [location, setLocation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const { user } = useGlobalStore();

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setImageFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
        multiple: false,
    });

    const handleSubmit = async () => {
        setLoading(true);

        if (postContent.trim() && user) {
            const res = await createPost({
                user_id: user.id,
                content: postContent,
                image: imageFile || undefined,
                location,
            });

            setLoading(false);
            if (res?.success) {
                setPostContent("");
                setImageFile(null);
                setLocation("");
                handleClose();
            }
        }
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
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
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "grey.600",
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Box
                        {...getRootProps()}
                        sx={{
                            border: "2px dashed gray",
                            borderRadius: "20px",
                            padding: 0,
                            textAlign: "center",
                            cursor: "pointer",
                            marginBottom: 2,
                            height: "500px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <input {...getInputProps()} />
                        {imageFile ? (
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "20px" }}
                            />
                        ) : (
                            <Typography>Drag & drop an image, or click to select one</Typography>
                        )}
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        label="Write a caption"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        sx={{ marginBottom: 2, "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        sx={{ marginBottom: 2, "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={!postContent.trim()}
                        sx={{ borderRadius: "15px", height: "45px" }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Post"}
                    </Button>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CreatePostModal;
