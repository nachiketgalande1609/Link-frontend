import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Button, LinearProgress, Modal, Stack, ThemeProvider, Typography } from "@mui/material";

import { useGlobalStore } from "./store/store";

import socket from "./services/socket";

import PrivateRoute from "./component/PrivateRoute";
import PublicRoute from "./component/PublicRoute";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import SearchPage from "./pages/SearchPage";
import { extendTheme } from "@mui/material/styles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Messages from "./pages/messages/Messages";
import Notifications from "./pages/notifications/Notifications";
import SettingsPage from "./pages/SettingsPage";
import { getNotificationsCount } from "./services/api";
import NavDrawer from "./component/navbar/NavDrawer";
import SavedPage from "./pages/SavedPage";
import VideoCallModal from "./component/VideoCallModal";

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

type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

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
    const { user, unreadNotificationsCount, setUnreadNotificationsCount, unreadMessagesCount, setUnreadMessagesCount } = useGlobalStore();
    const [notificationAlert, setNotificationAlert] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { postUploading } = useGlobalStore();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const closeVideoCall = (): void => setIsVideoModalOpen(false);

    const [callParticipantId, setCallParticipantId] = useState<number | null>(null);

    const iceServers = {
        iceServers: [{ urls: "stun:stun1.l.google.com:19302" }],
    };

    // Update all RTCPeerConnection creations to use this config:
    const newPc = new RTCPeerConnection(iceServers);

    const [incomingCall, setIncomingCall] = useState<{
        from: number;
        signal: RTCSessionDescriptionInit;
        callerUsername: string;
        callerProfilePicture: string;
    } | null>(null);

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

    useEffect(() => {
        const handleCallReceived = (data: {
            signal: RTCSessionDescriptionInit;
            from: number;
            callerUsername: string;
            callerProfilePicture: string;
        }) => {
            setIncomingCall(data);
        };

        socket.on("callReceived", handleCallReceived);

        return () => {
            socket.off("callReceived", handleCallReceived);
        };
    }, []);

    useEffect(() => {
        const handleIceCandidate = (data: { candidate: RTCIceCandidateInit }) => {
            if (pc) {
                pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
            }
        };

        socket.on("iceCandidate", handleIceCandidate);

        return () => {
            socket.off("iceCandidate", handleIceCandidate);
        };
    }, [pc]);

    useEffect(() => {
        const handleAnswerCall = (data: { signal: RTCSessionDescriptionInit }) => {
            if (pc) {
                pc.setRemoteDescription(new RTCSessionDescription(data.signal)).catch(console.error);
            }
        };

        socket.on("answerCall", handleAnswerCall);

        return () => {
            socket.off("answerCall", handleAnswerCall);
        };
    }, [pc]);

    const handleTrackEvent = (event: RTCTrackEvent) => {
        console.log("Received tracks:", event.streams);
        if (event.streams && event.streams[0]) {
            const newRemoteStream = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newRemoteStream.addTrack(track);
            });
            setRemoteStream(newRemoteStream);
        }
    };

    const handleAcceptCall = () => {
        if (incomingCall) {
            setCallParticipantId(incomingCall.from);

            setIsVideoModalOpen(true);
            const newPc = new RTCPeerConnection(iceServers);
            setPc(newPc);

            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setLocalStream(stream);
                    stream.getTracks().forEach((track) => newPc.addTrack(track, stream));
                })
                .catch(console.error);

            newPc.ontrack = handleTrackEvent;

            console.log(newPc);

            newPc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("emitting 2");

                    socket.emit("iceCandidate", { to: incomingCall.from, candidate: event.candidate });
                }
            };

            newPc
                .setRemoteDescription(new RTCSessionDescription(incomingCall.signal))
                .then(() => newPc.createAnswer())
                .then((answer) => newPc.setLocalDescription(answer))
                .then(() => {
                    socket.emit("answerCall", { to: incomingCall.from, signal: newPc.localDescription });
                })
                .catch(console.error);

            setIncomingCall(null);
        }
    };

    const handleRejectCall = () => {
        setIncomingCall(null);
        handleEndCall();
    };

    const handleVideoCall = () => {
        if (selectedUser) {
            setCallParticipantId(selectedUser.id);
            setIsVideoModalOpen(true);

            const newPc = new RTCPeerConnection(iceServers);
            setPc(newPc);

            // Add ontrack handler for remote stream
            newPc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setLocalStream(stream);
                    stream.getTracks().forEach((track) => newPc.addTrack(track, stream));
                })
                .catch(console.error);

            newPc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("iceCandidate", { to: selectedUser.id, candidate: event.candidate });
                }
            };

            newPc
                .createOffer()
                .then((offer) => newPc.setLocalDescription(offer))
                .then(() => {
                    socket.emit("callUser", {
                        from: currentUser.id,
                        to: selectedUser.id,
                        signal: newPc.localDescription,
                        callerUsername: currentUser.username,
                        callerProfilePicture: currentUser.profile_picture_url,
                    });
                })
                .catch(console.error);
        }
    };

    const handleEndCall = () => {
        if (callParticipantId) {
            socket.emit("endCall", { to: callParticipantId });
            // Reset all media tracks
            if (localStream) {
                localStream.getTracks().forEach((track) => {
                    track.stop();
                    localStream.removeTrack(track);
                });
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach((track) => {
                    track.stop();
                    remoteStream.removeTrack(track);
                });
            }
            // Close connections and reset states
            if (pc) pc.close();
            setPc(null);
            setLocalStream(null);
            setRemoteStream(null);
            setCallParticipantId(null); // Reset participant ID
        }
        closeVideoCall();
    };

    // Add this useEffect to listen for the endCall event
    useEffect(() => {
        const handleEndCallReceived = () => {
            closeVideoCall();
            setCallParticipantId(null);

            if (pc) {
                pc.close();
                setPc(null);
            }
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
                setLocalStream(null);
            }
            setRemoteStream(null);
        };

        socket.on("endCall", handleEndCallReceived);

        return () => {
            socket.off("endCall", handleEndCallReceived);
        };
    }, [pc, localStream]);

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
                                <Messages
                                    onlineUsers={onlineUsers}
                                    selectedUser={selectedUser}
                                    setSelectedUser={setSelectedUser}
                                    handleVideoCall={handleVideoCall}
                                />
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
                        path="/search"
                        element={
                            <PrivateRoute>
                                <SearchPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/saved"
                        element={
                            <PrivateRoute>
                                <SavedPage />
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
            {postUploading && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        zIndex: 1000,
                    }}
                >
                    <LinearProgress
                        sx={{
                            width: "100%",
                            height: "5px",
                            background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                            "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                            },
                        }}
                    />
                </Box>
            )}
            {/* Incoming Call Modal */}
            <Modal open={!!incomingCall} onClose={handleRejectCall}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        textAlign: "center",
                        borderRadius: "20px",
                    }}
                >
                    <img
                        src={incomingCall?.callerProfilePicture}
                        alt="Caller Profile"
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginBottom: "16px",
                        }}
                    />
                    <Typography>{incomingCall?.callerUsername}</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "#999999" }}>is calling you</Typography>
                    <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ marginTop: 2 }}>
                        <Button variant="contained" sx={{ borderRadius: "15px" }} color="success" onClick={handleAcceptCall}>
                            Accept
                        </Button>
                        <Button variant="contained" sx={{ borderRadius: "15px" }} color="error" onClick={handleRejectCall}>
                            Reject
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            <VideoCallModal
                open={isVideoModalOpen}
                onClose={closeVideoCall}
                callerId={currentUser.id}
                receiverId={callParticipantId || 0}
                localStream={localStream}
                remoteStream={remoteStream}
                pc={pc}
                handleEndCall={handleEndCall} // Pass handleEndCall here
            />
        </Box>
    );
};

export default App;
