import { useState, useEffect } from "react";
import { Container, List, CircularProgress, Typography } from "@mui/material";
import { followUser, getNotifications, respondToFollowRequest } from "../../services/api";
import { useUser } from "../../context/userContext";
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
    image_url?: string;
    request_status: string;
    requester_id?: number;
    request_id: number;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
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
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            {loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />
            ) : notifications.length === 0 ? (
                <Typography sx={{ textAlign: "center", mt: 3, color: "gray" }}>No new notifications.</Typography>
            ) : (
                <List>
                    {notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onFollowBack={handleFollowBack}
                            onFollowRequestResponse={handleFollowRequestResponse}
                        />
                    ))}
                </List>
            )}
        </Container>
    );
};

export default NotificationsPage;
