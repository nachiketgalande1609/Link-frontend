import { useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { updatePrivacy } from "../../services/api";
import { useNotifications } from "@toolpad/core/useNotifications";

const AccountPrivacy = () => {
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const [isPrivate, setIsPrivate] = useState(currentUser.is_private);

    const handleToggle = async () => {
        const newPrivacyStatus = !isPrivate;
        setIsPrivate(newPrivacyStatus);
        setLoading(true);

        try {
            const res = await updatePrivacy(currentUser?.id, newPrivacyStatus);
            if (res.success) {
                currentUser.is_private = newPrivacyStatus;
                localStorage.setItem("user", JSON.stringify(currentUser));
                notifications.show(`Account privacy changed to ${newPrivacyStatus ? "Private" : "Public"}`, {
                    severity: "success",
                    autoHideDuration: 3000,
                });
            }
        } catch (error) {
            console.error("Error updating privacy setting:", error);
            setIsPrivate(!newPrivacyStatus); // Revert on failure
        } finally {
            setLoading(false);
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
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography>Privacy</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPrivate}
                                onChange={handleToggle}
                                disabled={loading} // Disable while updating
                            />
                        }
                        label={isPrivate ? "Private" : "Public"}
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

export default AccountPrivacy;
