import { Dialog, Button, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@toolpad/core/useNotifications";
import socket from "../../services/socket";
import { unfollowUser } from "../../services/api";

interface MoreOptionsDialogProps {
    openDialog: boolean;
    handleCloseDialog: () => void;
    userId: string | undefined;
    fetchProfile: () => void;
    fetchUserPosts: () => void;
    isFollowing: boolean | undefined;
}

export default function MoreOptionsDialog({
    openDialog,
    handleCloseDialog,
    userId,
    fetchProfile,
    fetchUserPosts,
    isFollowing,
}: MoreOptionsDialogProps) {
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
            notifications.show("Failed to copy link. Please try again later.", {
                severity: "error",
                autoHideDuration: 3000,
            });
        }
    };

    const handleLogout = () => {
        if (currentUser) {
            socket.disconnect();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("privateKey");

        handleCloseDialog();
        navigate("/login");
    };

    const handleUnfollow = async () => {
        try {
            const res = await unfollowUser(currentUser.id, userId || "");
            if (res.success) {
                handleCloseDialog();
                notifications.show("User Unfollowed", {
                    severity: "success",
                    autoHideDuration: 3000,
                });
                fetchProfile();
                fetchUserPosts();
            }
        } catch (err) {
            console.error("Unfollow reuest failed:", err);
            notifications.show("Failed to unfollow user. Please try again later.", {
                severity: "error",
                autoHideDuration: 3000,
            });
        }
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                },
            }}
        >
            {currentUser?.id != userId && isFollowing && (
                <Button
                    fullWidth
                    onClick={handleUnfollow}
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
                    Unfollow
                </Button>
            )}
            {currentUser?.id == userId && (
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
            {isMobile && currentUser?.id == userId && (
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
                </>
            )}
            {currentUser?.id == userId && (
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
