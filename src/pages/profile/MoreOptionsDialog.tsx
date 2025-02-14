import { Dialog, Button, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@toolpad/core/useNotifications";
import socket from "../../services/socket";

interface MoreOptionsDialogProps {
    openDialog: boolean;
    handleCloseDialog: () => void;
}

export default function MoreOptionsDialog({ openDialog, handleCloseDialog }: MoreOptionsDialogProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const notifications = useNotifications();

    const profileUrl = `${window.location.origin}${location.pathname}`;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const handleEditProfile = () => {
        navigate("/settings?setting=profiledetails");
        handleCloseDialog();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            notifications.show("Profile link copied to clipboard!", {
                severity: "success",
                autoHideDuration: 3000,
            });
            handleCloseDialog();
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleLogout = () => {
        if (currentUser) {
            socket.disconnect();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        handleCloseDialog();
        navigate("/login");
    };

    return (
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="xs"
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: "20px",
                    backgroundColor: "rgba(32, 35, 39, 0.9)",
                    color: "white",
                    textAlign: "center",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                },
            }}
        >
            {currentUser?.id && (
                <Button
                    fullWidth
                    onClick={handleEditProfile}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                        borderBottom: "1px solid #505050",
                    }}
                >
                    Edit Profile
                </Button>
            )}
            <Button
                fullWidth
                onClick={handleCopyLink}
                sx={{
                    padding: "10px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    backgroundColor: "#202327",
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { backgroundColor: "#2e3238" },
                    borderBottom: "1px solid #505050",
                }}
            >
                Copy Profile Link
            </Button>
            {isMobile && (
                <>
                    <Button
                        fullWidth
                        onClick={() => {
                            navigate("/settings?setting=profiledetails");
                            handleCloseDialog();
                        }}
                        sx={{
                            padding: "10px",
                            fontSize: isMobile ? "0.85rem" : "0.9rem",
                            backgroundColor: "#202327",
                            textTransform: "none",
                            borderRadius: 0,
                            "&:hover": { backgroundColor: "#2e3238" },
                            borderBottom: "1px solid #505050",
                        }}
                    >
                        Settings
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => {
                            handleLogout();
                            handleCloseDialog();
                        }}
                        sx={{
                            padding: "10px",
                            fontSize: isMobile ? "0.85rem" : "0.9rem",
                            backgroundColor: "#202327",
                            textTransform: "none",
                            borderRadius: 0,
                            "&:hover": { backgroundColor: "#2e3238" },
                            borderBottom: "1px solid #505050",
                        }}
                    >
                        Logout
                    </Button>
                </>
            )}
            <Button
                fullWidth
                onClick={handleCloseDialog}
                sx={{
                    padding: "10px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    backgroundColor: "#202327",
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { backgroundColor: "#2e3238" },
                }}
            >
                Cancel
            </Button>
        </Dialog>
    );
}
