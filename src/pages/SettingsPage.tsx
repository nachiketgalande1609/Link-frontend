import { Box, TextField, Button, Typography, Avatar, Paper, Divider } from "@mui/material";
import { useState } from "react";
import { useUser } from "../context/userContext";

const SettingsPage = () => {
    const { user } = useUser();
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUsername(e.target.value);
    };

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewProfilePic(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (newProfilePic) {
            // Handle the logic to upload the new profile picture
            const formData = new FormData();
            formData.append("profile_pic", newProfilePic);
            // Upload API call goes here
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 3, minHeight: "100vh" }}>
            <Paper sx={{ width: "100%", maxWidth: 600, padding: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h4" sx={{ marginBottom: 2, textAlign: "center" }}>
                    Account Settings
                </Typography>

                <Box sx={{ marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                        src={user?.profile_picture_url || ""}
                        sx={{
                            width: 120,
                            height: 120,
                            marginBottom: 2,
                            border: "4px solid #00aaff",
                            objectFit: "cover",
                        }}
                    />
                    <Button component="label" sx={{ marginTop: 1 }} variant="contained" color="primary">
                        Change Profile Picture
                        <input type="file" hidden onChange={handleProfilePicChange} />
                    </Button>
                </Box>

                <Divider sx={{ marginBottom: 3 }} />

                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={newUsername}
                    onChange={handleUsernameChange}
                    sx={{
                        marginBottom: 3,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                        },
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    fullWidth
                    sx={{
                        padding: "12px 0",
                        borderRadius: "25px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        "&:hover": {
                            backgroundColor: "#007bb5",
                        },
                    }}
                >
                    Save Changes
                </Button>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
