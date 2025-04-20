import { useState, useEffect } from "react";
import { Container, List, Typography, LinearProgress, useMediaQuery } from "@mui/material";
import { followUser, getNotifications, respondToFollowRequest } from "../../services/api";
import { useGlobalStore } from "../../store/store";
import NotificationCard from "./NotificationCard";

interface Notification {
    id: number;
    type: string;
    message: string;
    post_id: number | null;
    created_at: string;
    sender_id: string;
    username: string;
    profile_picture: string;
    file_url?: string;
    request_status: string;
    requester_id?: number;
    request_id: number;
}

const NotificationsPage = () => {
    const { unreadNotificationsCount, resetNotificationsCount } = useGlobalStore();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const isLarge = useMediaQuery("(min-width:1281px)");
    const [followRequestAcceptLoading, setFollowRequestAcceptLoading] = useState(false);
    const [followRequestRejectLoading, setFollowRequestRejectLoading] = useState(false);

    async function fetchNotifications() {
        if (!currentUser?.id) return;
        try {
            setLoading(true);
            const res = await getNotifications();
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
    }, [currentUser?.id, unreadNotificationsCount]);

    const handleFollowBack = async (userId: string) => {
        if (!currentUser?.id || !userId) return;
        try {
            setLoading(true);
            const res = await followUser(currentUser.id.toString(), userId);
            if (res?.success) await fetchNotifications();
        } catch (error) {
            console.error("Failed to follow the user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowRequestResponse = async (request_id: number, response: "accepted" | "rejected") => {
        response === "accepted" && setFollowRequestAcceptLoading(true);
        response === "rejected" && setFollowRequestRejectLoading(true);

        try {
            setLoading(true);
            const res = await respondToFollowRequest(request_id, response);
            if (res?.success) await fetchNotifications();
        } catch (error) {
            console.error(`Failed to ${response} the follow request:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <LinearProgress
                    sx={{
                        width: "100%",
                        height: "3px",
                        background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                        "& .MuiLinearProgress-bar": {
                            background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                        },
                    }}
                />
            ) : (
                <Container sx={{ maxWidth: "100%", width: isLarge ? "600px" : "525px", mt: 4 }}>
                    {notifications.length === 0 ? (
                        <Typography sx={{ textAlign: "center", mt: 3, color: "gray" }}>No new notifications.</Typography>
                    ) : (
                        <List>
                            {notifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onFollowBack={handleFollowBack}
                                    onFollowRequestResponse={handleFollowRequestResponse}
                                    followRequestAcceptLoading={followRequestAcceptLoading}
                                    followRequestRejectLoading={followRequestRejectLoading}
                                />
                            ))}
                        </List>
                    )}
                </Container>
            )}
        </>
    );
};

export default NotificationsPage;
