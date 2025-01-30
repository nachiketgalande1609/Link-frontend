import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Backdrop, Fade, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { createPost } from "../../services/api";
import { useUser } from "../../context/userContext";

// Define prop types
interface CreatePostModalProps {
    open: boolean;
    handleClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, handleClose }) => {
    const [postContent, setPostContent] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [privacy, setPrivacy] = useState<string>("public");

    const { user } = useUser();

    const handleSubmit = async () => {
        if (postContent.trim() && user) {
            const res = await createPost({
                user_id: user.userId,
                content: postContent,
                image_url: imageUrl,
                video_url: videoUrl,
                location,
                tags,
                privacy,
            });
            if (res?.success) {
                setPostContent("");
                setImageUrl("");
                setVideoUrl("");
                setLocation("");
                setTags("");
                setPrivacy("public");
                handleClose();
            }
        }
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
            <Fade in={open}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Create a Post
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        label="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Video URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Privacy</InputLabel>
                        <Select value={privacy} onChange={(e) => setPrivacy(e.target.value)} label="Privacy">
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="friends">Friends</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} disabled={!postContent.trim()}>
                        Post
                    </Button>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CreatePostModal;
