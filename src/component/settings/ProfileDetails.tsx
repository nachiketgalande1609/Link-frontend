import { useState, useEffect } from "react";
import { Avatar, Button, Box, TextField, IconButton, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useDropzone } from "react-dropzone";
import { uploadProfilePicture } from "../../services/api";
import { useGlobalStore } from "../../store/store";
import { updateProfileDetails } from "../../services/api";
import { getProfile } from "../../services/api";
import { useNotifications } from "@toolpad/core/useNotifications";

interface Profile {
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
    is_request_active: boolean;
    follow_status: string;
    is_following: boolean;
    is_private: boolean;
    isMobile: boolean;
}

const ProfileDetails = () => {
    const { setUser } = useGlobalStore();
    const notifications = useNotifications();

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const [profileData, setProfileData] = useState<Profile | null>(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const [newBio, setNewBio] = useState("");
    const [profileUpdating, setProfileUpdating] = useState(false);

    const [cropper, setCropper] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        if (profileData) {
            setIsModified(newUsername !== profileData.username || newBio !== profileData.bio);
        }
    }, [newUsername, newBio, profileData]);

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

    async function fetchProfile() {
        try {
            if (user?.id) {
                const res = await getProfile(user?.id, user?.id);
                setProfileData(res.data);
                setNewUsername(res.data.username);
                setNewBio(res.data.bio);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const handleUploadProfilePic = () => {
        if (cropper && user?.id) {
            setUploading(true);
            const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
            const file = dataURItoFile(croppedDataUrl);
            uploadProfilePicture(user.id, file)
                .then((response) => {
                    const updatedUser = { ...user, profile_picture_url: response.fileUrl };
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    notifications.show("Profile picture updated successfully!", {
                        severity: "success",
                        autoHideDuration: 3000,
                    });
                    setOpenDialog(false);
                })
                .catch((error) => {
                    console.error("Failed to upload profile picture:", error);
                })
                .finally(() => {
                    setUploading(false);
                    setNewProfilePic(null);
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

    const handleUpdateProfile = async () => {
        if (!user?.id) {
            console.error("User ID is missing.");
            return;
        }
        setProfileUpdating(true);
        try {
            await updateProfileDetails(user.id, { username: newUsername, bio: newBio });
            const updatedUser = { ...user, username: newUsername };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            notifications.show("Profile details updated successfully!", {
                severity: "success",
                autoHideDuration: 3000,
            });
        } catch (error) {
            console.error("Failed to update username:", error);
        } finally {
            setProfileUpdating(false);
        }
    };

    return (
        <Box
            sx={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                p: 4,
            }}
        >
            <Box sx={{ maxWidth: "800px", width: "80%" }}>
                <Typography variant="h6" sx={{ mb: "20px" }}>
                    Account Privacy
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "800px",
                    width: "80%",
                    padding: 3,
                    borderRadius: 2,
                    backgroundColor: "#202327",
                }}
            >
                <Box sx={{ position: "relative", mb: 3 }}>
                    <Avatar
                        src={
                            user?.profile_picture_url
                                ? `${user.profile_picture_url}?t=${new Date().getTime()}`
                                : "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                        }
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
                <TextField
                    label="Bio"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    sx={{
                        marginBottom: 3,
                        "& .MuiOutlinedInput-root": { borderRadius: "20px" },
                    }}
                />
                <Box sx={{ display: "flex", width: "100%", justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleUpdateProfile}
                        disabled={!isModified || profileUpdating}
                        sx={{
                            borderRadius: "15px",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#007bb5" },
                            width: "150px",
                        }}
                    >
                        {profileUpdating ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                    </Button>
                </Box>
            </Box>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        padding: "10px",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
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
                    <Button onClick={() => setOpenDialog(false)} color="primary" disabled={uploading} sx={{ borderRadius: "15px" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleUploadProfilePic} color="primary" disabled={uploading} sx={{ borderRadius: "15px" }}>
                        Upload Photo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileDetails;
