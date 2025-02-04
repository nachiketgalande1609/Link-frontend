import { Box, TextField, Button, Typography, Avatar, Paper, Divider, List, ListItem, ListItemText, Drawer } from "@mui/material";
import { useState } from "react";
import { useUser } from "../context/userContext";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = ["Edit Profile", "Notifications", "Account Privacy", "Blocked", "Comments"];

const SettingsPage = () => {
    const { user } = useUser();
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const currentSetting = queryParams.get("setting");

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
            const formData = new FormData();
            formData.append("profile_pic", newProfilePic);
            // Upload API call goes here
        }
    };

    const handleMenuItemClick = (setting: string) => {
        navigate(`/settings?setting=${setting}`);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar Navigation */}
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
                                    backgroundColor: settingKey === currentSetting ? "#ffffff" : "transparent", // Highlight active item
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

            {/* Main Settings Content */}
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: 3 }}>
                {currentSetting === "editprofile" && (
                    <Paper sx={{ width: "100%", maxWidth: 600, padding: 4, borderRadius: 3, boxShadow: 3 }}>
                        <Box sx={{ marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                                src={user?.profile_picture_url || ""}
                                sx={{ width: 120, height: 120, marginBottom: 2, border: "4px solid #00aaff" }}
                            />
                            <Button component="label" sx={{ marginTop: 1, borderRadius: "20px" }} variant="contained" color="primary">
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
                                    borderRadius: "20px",
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
                                borderRadius: "20px",
                                textTransform: "uppercase",
                                fontWeight: "bold",
                                "&:hover": { backgroundColor: "#007bb5" },
                            }}
                        >
                            Save Changes
                        </Button>
                    </Paper>
                )}
                {!currentSetting && (
                    <Typography sx={{ textAlign: "center", color: "gray", marginTop: 4 }}>
                        Please select a setting option from the left to manage your account preferences.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default SettingsPage;
