import { Box, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileDetails from "../component/settings/ProfileDetails"; // Import the new ProfileDetails component
import AccountPrivacy from "../component/settings/AccountPrivacy";
import General from "../component/settings/General";

const menuItems = ["Profile Details", "General", "Account Privacy", "Notifications", "Blocked", "Comments"];

const SettingsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const currentSetting = queryParams.get("setting");

    const handleMenuItemClick = (setting: string) => {
        navigate(`/settings?setting=${setting}`);
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
                                    "&:hover": settingKey === currentSetting ? { backgroundColor: "#ffffff" } : { backgroundColor: "#202327" },
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
                {currentSetting === "profiledetails" ? (
                    <ProfileDetails />
                ) : currentSetting === "accountprivacy" ? (
                    <AccountPrivacy />
                ) : currentSetting === "general" ? (
                    <General />
                ) : (
                    <Typography variant="h6" color="textSecondary">
                        Please Select a settings category
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default SettingsPage;
