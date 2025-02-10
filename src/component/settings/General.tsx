import { useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useNotifications } from "@toolpad/core/useNotifications";

const General = () => {
    const notifications = useNotifications();
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const [themeMode, setThemeMode] = useState(currentUser.theme || "light");

    const handleToggle = async () => {
        const newTheme = themeMode === "light" ? "dark" : "light";
        setThemeMode(newTheme);

        // Update theme in localStorage
        const updatedUser = { ...currentUser, theme: newTheme };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        notifications.show(`Theme changed to ${newTheme}`, {
            severity: "success",
            autoHideDuration: 3000,
        });
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
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography>Theme</Typography>
                    <FormControlLabel
                        control={<Switch checked={themeMode === "dark"} onChange={handleToggle} />}
                        label={themeMode === "dark" ? "dark" : "light"}
                        labelPlacement="start"
                        sx={{
                            marginLeft: 2,
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default General;
