import React, { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import EditProfile from "../component/settings/EditProfile"; // Import the new EditProfile component
import { updateProfileDetails } from "../services/api";

const menuItems = ["Edit Profile", "Notifications", "Account Privacy", "Blocked", "Comments"];

const SettingsPage = () => {
    const { setUser } = useUser();

    const user = JSON.parse(localStorage.getItem("user") || "");

    const [newUsername, setNewUsername] = useState(user?.username || "");
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const currentSetting = queryParams.get("setting");

    const handleMenuItemClick = (setting: string) => {
        navigate(`/settings?setting=${setting}`);
    };

    const handleSaveUsername = async () => {
        if (!user?.id) {
            console.error("User ID is missing.");
            return;
        }

        try {
            await updateProfileDetails(user.id, { username: newUsername });
            const updatedUser = { ...user, username: newUsername };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            // Call your API here to update the username
        } catch (error) {
            console.error("Failed to update username:", error);
        }
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

            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {currentSetting === "editprofile" && (
                    <EditProfile newUsername={newUsername} setNewUsername={setNewUsername} handleSaveUsername={handleSaveUsername} />
                )}
            </Box>
        </Box>
    );
};

export default SettingsPage;
