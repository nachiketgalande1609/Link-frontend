import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider } from "@mui/material";

import { useUser } from "./context/userContext";
import socket from "./services/socket";

import PrivateRoute from "./component/PrivateRoute";
import PublicRoute from "./component/PublicRoute";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import { extendTheme } from "@mui/material/styles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Messages from "./pages/messages/Messages";
import Notifications from "./pages/notifications/Notifications";
import SettingsPage from "./pages/SettingsPage";
import { getNotificationsCount } from "./services/api";
import NavDrawer from "./component/navbar/NavDrawer";

const demoTheme = extendTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: "class",
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});

const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

if (currentUser && currentUser.id) {
    socket.emit("registerUser", currentUser.id);
}

const App = () => {
    return (
        <ThemeProvider theme={demoTheme}>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
};

const AppContent = () => {
    const { user, unreadNotificationsCount, setUnreadNotificationsCount, unreadMessagesCount, setUnreadMessagesCount } = useUser();
    const [notificationAlert, setNotificationAlert] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        socket.on("onlineUsers", (data) => {
            setOnlineUsers(data);
        });

        return () => {
            socket.off("onlineUsers");
        };
    }, []);

    // Windows Notifications Permission
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchNotificationCount = async () => {
            try {
                const response = await getNotificationsCount(user.id);
                if (response?.success) {
                    setUnreadNotificationsCount(response?.data?.unread_notifications);
                    setUnreadMessagesCount(response?.data?.unread_messages);
                }
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };

        fetchNotificationCount();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const handleUnreadCountResponse = (data: { targetUserId: string; unreadCount: number }) => {
            const { targetUserId, unreadCount } = data;
            if (targetUserId === user.id) {
                setUnreadNotificationsCount(unreadCount);
            }
        };

        socket.on("unreadCountResponse", handleUnreadCountResponse);

        return () => {
            socket.off("unreadCountResponse", handleUnreadCountResponse);
        };
    }, [user, setUnreadNotificationsCount]);

    useEffect(() => {
        if (!user) return;

        const handleNotificationAlertResponse = (data: { targetUserId: string; notificationMessage: string }) => {
            if (Notification.permission === "granted") {
                new Notification("Link", {
                    body: data.notificationMessage,
                    icon: "https://t4.ftcdn.net/jpg/01/33/48/03/360_F_133480376_PWlsZ1Bdr2SVnTRpb8jCtY59CyEBdoUt.jpg", // Optional icon URL
                });
            }
        };

        socket.on("notificationAlert", handleNotificationAlertResponse);
        console.log(notificationAlert);

        return () => {
            socket.off("notificationAlert", handleNotificationAlertResponse);
        };
    }, [user, setNotificationAlert]);

    return (
        <Box sx={{ display: "flex" }}>
            <NavDrawer
                unreadMessagesCount={unreadMessagesCount}
                unreadNotificationsCount={unreadNotificationsCount}
                setUnreadMessagesCount={setUnreadMessagesCount}
            />
            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, padding: 0, margin: 0, width: "100%" }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route
                        path="/messages/:userId?"
                        element={
                            <PrivateRoute>
                                <Messages onlineUsers={onlineUsers} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <PrivateRoute>
                                <ExplorePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <PrivateRoute>
                                <SearchPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default App;
