import React, { useState } from "react";
import { Avatar, Button, Box, TextField, IconButton, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useDropzone } from "react-dropzone";
import { uploadProfilePicture } from "../../services/api";
import { useUser } from "../../context/userContext";

interface EditProfileProps {
    newUsername: string;
    setNewUsername: React.Dispatch<React.SetStateAction<string>>;
    handleSaveUsername: () => void;
    usernameUpdating: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ newUsername, setNewUsername, handleSaveUsername, usernameUpdating }) => {
    const { user, setUser } = useUser();
    const [openDialog, setOpenDialog] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
    const [cropper, setCropper] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, open } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file && file.type.startsWith("image/")) {
                setNewProfilePic(file);
                setOpenDialog(true);
            } else {
                console.error("Invalid file type. Please upload an image.");
            }
        },
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/gif": [],
        },
        noClick: true,
    });

    const handleUploadProfilePic = () => {
        if (cropper && user?.id) {
            setUploading(true);
            const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
            const file = dataURItoFile(croppedDataUrl);
            uploadProfilePicture(user.id, file)
                .then((response) => {
                    const updatedUser = { ...user, profile_picture_url: response.imageUrl };
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setOpenDialog(false);
                })
                .catch((error) => {
                    console.error("Failed to upload profile picture:", error);
                })
                .finally(() => {
                    setUploading(false);
                });
        }
    };

    const dataURItoFile = (dataURI: string): File => {
        const byteString = atob(dataURI.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: "image/jpeg" });
        return new File([blob], "profile_picture.jpg", { type: "image/jpeg", lastModified: Date.now() });
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                p: 2,
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "800px",
                    width: "100%",
                    padding: 3,
                    borderRadius: 2,
                }}
            >
                <Box sx={{ position: "relative", mb: 3 }}>
                    <Avatar
                        src={user?.profile_picture_url ? `${user.profile_picture_url}?t=${new Date().getTime()}` : ""}
                        sx={{ width: 120, height: 120, marginBottom: 2, border: "4px solid #fff" }}
                    />
                    <IconButton
                        sx={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "#fff", borderRadius: "50%" }}
                        onClick={() => {
                            setOpenDialog(true);
                            open();
                        }}
                        aria-label="Change profile picture"
                    >
                        <CameraAltIcon sx={{ color: "#000" }} />
                    </IconButton>
                </Box>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    sx={{
                        marginBottom: 3,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                        },
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveUsername}
                    fullWidth
                    sx={{
                        padding: "12px 0",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#007bb5" },
                    }}
                >
                    {usernameUpdating ? <CircularProgress size={24} color="inherit" sx={{ marginRight: 2 }} /> : "Save Changes"}
                </Button>
            </Box>

            {/* Dialog for image cropping and uploading */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        padding: "10px",
                    },
                }}
            >
                <DialogContent>
                    {uploading ? (
                        <Box
                            {...getRootProps()}
                            sx={{
                                width: 500,
                                height: 400,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <CircularProgress size={24} color="inherit" />
                        </Box>
                    ) : (
                        <Box
                            {...getRootProps()}
                            sx={{
                                width: 500,
                                height: 400,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "2px dashed #ccc",
                                borderRadius: "20px",
                            }}
                        >
                            {newProfilePic ? (
                                <Cropper
                                    src={URL.createObjectURL(newProfilePic)}
                                    style={{ height: "100%", width: "100%" }}
                                    initialAspectRatio={1}
                                    aspectRatio={1}
                                    guides={false}
                                    viewMode={1}
                                    background={false}
                                    responsive={true}
                                    autoCropArea={1}
                                    checkOrientation={false}
                                    onInitialized={(instance) => {
                                        setCropper(instance);
                                    }}
                                />
                            ) : (
                                <Typography variant="h6" color="textSecondary">
                                    Drop or select a file
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary" disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUploadProfilePic} color="primary" disabled={uploading}>
                        Upload Photo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditProfile;
