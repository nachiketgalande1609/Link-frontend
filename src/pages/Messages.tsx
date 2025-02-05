import { useState, useEffect } from "react";
import { Container, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../services/socket";
import api from "../services/config";

type Message = { sender_id: number; message_text: string; timestamp: string };

type MessagesType = {
    [key: number]: Message[];
};

type User = {
    id: number;
    username: string;
    profile_picture: string;
};

const currentUser = JSON.parse(localStorage.getItem("user") || "");

const Messages = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<MessagesType>({});
    const [inputMessage, setInputMessage] = useState("");

    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Use to track the current route

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // If the route is `/messages`, reset selectedUser to null
        if (location.pathname === "/messages") {
            setSelectedUser(null);
        }
    }, [location.pathname]);

    useEffect(() => {
        // If userId is in the URL, select that user
        if (userId) {
            const user = users.find((user) => user.id === parseInt(userId));
            setSelectedUser(user || null);
        }
    }, [userId, users]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/api/messages/${currentUser.id}`);
            setUsers(res.data.data.users);
            setMessages(res.data.data.messages);
        } catch (error) {
            console.error("Failed to fetch users and messages:", error);
        }
    };

    const handleUserClick = (userId: number) => {
        setSelectedUser(users.find((user) => user.id === userId) || null);
        navigate(`/messages/${userId}`); // Update the URL to reflect the selected user
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedUser) return;

        socket.emit("sendMessage", { text: inputMessage, sender: "User1" });
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* Users List */}
            <Box sx={{ width: "300px", backgroundColor: "#000000", color: "white", padding: 2, borderRight: "1px solid #333333" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Messages
                </Typography>
                <List>
                    {users?.map((user) => (
                        <ListItem
                            component="button"
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            sx={{
                                backgroundColor: selectedUser?.id === user.id ? "#ffffff" : "#1E1E1E",
                                padding: "12px",
                                borderRadius: "8px",
                                mb: 1,
                                textAlign: "left",
                                width: "100%",
                                border: "none",
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    sx={{ width: "50px", height: "50px", mr: "12px" }}
                                    src={user.profile_picture || "https://via.placeholder.com/40"}
                                />
                            </ListItemAvatar>
                            <ListItemText sx={{ color: selectedUser?.id === user.id ? "#000000" : "#ffffff" }} primary={user.username} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Messages Panel */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: "#000000", color: "white" }}>
                {selectedUser && (
                    <Box
                        sx={{
                            backgroundColor: "#000000",
                            padding: "15px",
                            display: "flex",
                            alignItems: "center",
                            borderBottom: "1px solid #333333",
                        }}
                    >
                        <Avatar sx={{ width: "40px", height: "40px", mr: 2 }} src={selectedUser.profile_picture} />
                        <Typography variant="h6">{selectedUser.username}</Typography>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, padding: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {selectedUser ? (
                        messages[selectedUser.id]?.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{ display: "flex", justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start", mb: 1 }}
                            >
                                <Typography
                                    sx={{
                                        backgroundColor: msg.sender_id === currentUser.id ? "#1976d2" : "#444",
                                        padding: "8px 12px",
                                        borderRadius: "12px",
                                        maxWidth: "70%",
                                    }}
                                >
                                    {msg.message_text}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", mt: 5 }}>
                            Select a user to start chatting
                        </Typography>
                    )}
                </Box>

                {selectedUser && (
                    <Box sx={{ display: "flex", padding: 2 }}>
                        <TextField fullWidth placeholder="Type a message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        <IconButton onClick={handleSendMessage} color="primary">
                            <SendIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Messages;
