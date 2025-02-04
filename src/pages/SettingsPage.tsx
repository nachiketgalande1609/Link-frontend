import {
    Box,
    Button,
    Avatar,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Drawer,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useUser } from "../context/userContext";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadProfilePicture } from "../services/api"; // your axios call for uploading
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const menuItems = ["Edit Profile", "Notifications", "Account Privacy", "Blocked", "Comments"];

const SettingsPage = () => {
    const { user, setUser } = useUser();
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [cropper, setCropper] = useState<any>(null); // reference to cropper instance
    const [uploading, setUploading] = useState(false); // loader state for uploading
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const currentSetting = queryParams.get("setting");

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUsername(e.target.value);
    };

    const handleProfilePicChange = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type.startsWith("image/")) {
            setNewProfilePic(file);
            setOpenDialog(true);
        } else {
            console.error("Invalid file type. Please upload an image.");
        }
    };

    const { getRootProps, open } = useDropzone({
        onDrop: (acceptedFiles) => handleProfilePicChange(acceptedFiles),
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/gif": [],
        },
        noClick: true,
    });

    // This function crops the image and then uploads it using axios.
    const handleUploadProfilePic = () => {
        if (cropper && user?.id) {
            setUploading(true);
            const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
            const file = dataURItoFile(croppedDataUrl);
            uploadProfilePicture(user.id, file)
                .then((response) => {
                    console.log("Profile picture uploaded:", response);
                    // Ensure the API returns the new URL as response.imageUrl
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

    // Helper function to convert a data URI to a File object.
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

    const handleMenuItemClick = (setting: string) => {
        navigate(`/settings?setting=${setting}`);
    };

    // This function now only handles username changes.
    const handleSaveUsername = () => {
        console.log("Username updated:", newUsername);
        // Add your username update API call here if needed.
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 250,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 250, boxSizing: "border-box", padding: 2, position: "relative", backgroundColor: "#000000" },
                }}
            >
                <Typography variant="h6" sx={{ textAlign: "center", marginBottom: 2 }}>
                    Settings
                </Typography>
                <List>
                    {menuItems.map((text, index) => {
                        const settingKey = text.toLowerCase().replace(" ", "");
                        return (
                            <ListItem
                                component="button"
                                key={index}
                                onClick={() => handleMenuItemClick(settingKey)}
                                sx={{
                                    border: "none",
                                    textDecoration: "none",
                                    padding: "8px 15px",
                                    borderRadius: "20px",
                                    backgroundColor: settingKey === currentSetting ? "#ffffff" : "transparent",
                                    "&:hover": settingKey === currentSetting ? { backgroundColor: "#ffffff" } : { backgroundColor: "#222222" },
                                    maxHeight: "62px",
                                    margin: "10px 0",
                                }}
                            >
                                <ListItemText sx={{ color: settingKey === currentSetting ? "#000000" : "white" }} primary={text} />
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>

            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: 3 }}>
                {currentSetting === "editprofile" && (
                    <Paper sx={{ width: "100%", maxWidth: 600, padding: 4, borderRadius: 3, boxShadow: 3 }}>
                        <Box sx={{ marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ position: "relative", mb: "20px" }}>
                                <Avatar
                                    src={user?.profile_picture_url ? `${user.profile_picture_url}?t=${new Date().getTime()}` : ""}
                                    sx={{ width: 120, height: 120, marginBottom: 2, border: "4px solid #ffffff" }}
                                />
                                <IconButton
                                    sx={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "white", borderRadius: "50%" }}
                                    onClick={() => {
                                        setOpenDialog(true);
                                        open();
                                    }}
                                >
                                    <CameraAltIcon sx={{ color: "#000000" }} />
                                </IconButton>
                            </Box>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={newUsername}
                                onChange={handleUsernameChange}
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
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>
                )}
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
                        <div
                            {...getRootProps()}
                            style={{
                                width: "500px",
                                height: "400px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <CircularProgress size={24} color="inherit" />
                        </div>
                    ) : (
                        <div
                            {...getRootProps()}
                            style={{
                                width: "500px",
                                height: "400px",
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
                        </div>
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

export default SettingsPage;
