import { useState, useEffect } from "react";
import {
    Container,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    ListItemAvatar,
    Avatar,
    Typography,
    Paper,
    Button,
    Box,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { followUser, getNotifications, respondToFollowRequest } from "../services/api"; // Assuming you have an API to handle follow request responses
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

interface Notification {
    id: number;
    type: string;
    message: string;
    post_id: number | null;
    created_at: string;
    sender_id: string;
    username: string;
    profile_picture: string;
    image_url?: string;
    request_status: string;
    requester_id?: number;
    request_id: number;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const { resetNotificationsCount } = useUser();

    async function fetchNotifications() {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            const res = await getNotifications(currentUser.id);
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
        resetNotificationsCount();
    }, [currentUser?.id]);

    const handleFollowBack = async (userId: string) => {
        if (currentUser?.id && userId) {
            try {
                setLoading(true);
                const res = await followUser(currentUser.id.toString(), userId);
                if (res?.success) {
                    await fetchNotifications();
                }
            } catch (error) {
                console.error("Failed to follow the user:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        navigate(`/profile/${notification.sender_id}`);
    };

    const handleFollowRequestResponse = async (request_id: number, response: "accepted" | "rejected") => {
        try {
            setLoading(true);
            const res = await respondToFollowRequest(request_id, response);
            if (res?.success) {
                await fetchNotifications(); // Refresh the notifications after responding
            }
        } catch (error) {
            console.error(`Failed to ${response} the follow request:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            {loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />
            ) : notifications.length === 0 ? (
                <Typography sx={{ textAlign: "center", mt: 3, color: "gray", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                    No new notifications.
                </Typography>
            ) : (
                <List>
                    {notifications.map((notification) => (
                        <Paper key={notification.id} sx={{ mb: 1, boxShadow: 2, borderRadius: "20px" }}>
                            <ListItem
                                component="div"
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    cursor: "pointer",
                                    padding: isMobile ? "14px" : "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    height: isMobile ? "80px" : "90px",
                                    justifyContent: "space-between",
                                    backgroundColor: "#202327",
                                    borderRadius: "20px",
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={notification.profile_picture}
                                        alt={notification.username}
                                        sx={{ height: isMobile ? "50px" : "58px", width: isMobile ? "50px" : "58px", mr: 2 }}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography sx={{ fontSize: isMobile ? "0.85rem" : "1rem" }}>
                                            {notification.username} {notification.message}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography color="gray" sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                                            {new Date(notification.created_at).toLocaleString()}
                                        </Typography>
                                    }
                                    sx={{ flexGrow: 1 }}
                                />
                                {notification.type === "follow" && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={
                                            notification.request_status === "pending"
                                                ? (e) => e.stopPropagation() // Don't trigger unnecessary action
                                                : (e) => {
                                                      e.stopPropagation();
                                                      handleFollowBack(notification.sender_id);
                                                  }
                                        }
                                        disabled={notification.request_status === "pending"}
                                        sx={{ ml: 2, borderRadius: "20px" }}
                                    >
                                        {notification.request_status === "accepted" ? "Following" : "Follow Back"}
                                    </Button>
                                )}
                                {notification.type === "follow_request" && (
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        {notification.request_status === "pending" ? (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFollowRequestResponse(notification.request_id, "accepted");
                                                    }}
                                                    sx={{ borderRadius: "20px" }}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFollowRequestResponse(notification.request_id, "rejected");
                                                    }}
                                                    sx={{ borderRadius: "20px" }}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outlined" size="small" disabled sx={{ ml: 2, borderRadius: "20px" }}>
                                                {notification.request_status === "accepted"
                                                    ? "Accepted"
                                                    : notification.request_status === "rejected"
                                                      ? "Rejected"
                                                      : null}
                                            </Button>
                                        )}
                                    </Box>
                                )}
                                {(notification.type === "like" || notification.type === "comment") && notification.image_url && (
                                    <Box sx={{ ml: 2, display: "flex", justifyContent: "flex-end", width: "80px" }}>
                                        <img
                                            src={notification.image_url}
                                            alt="Post image"
                                            style={{
                                                width: "58px",
                                                height: "58px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </Box>
                                )}
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}
        </Container>
    );
};

export default NotificationsPage;
