import { useState, useEffect, useRef } from "react";
import {
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Box,
    TextField,
    IconButton,
    useMediaQuery,
    useTheme,
    Drawer,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../services/socket";
import api from "../services/config";

type Message = { sender_id: number; message_text: string; timestamp: string };
type MessagesType = { [key: number]: Message[] };
type User = { id: number; username: string; profile_picture: string };

const Messages = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<MessagesType>({});
    const [inputMessage, setInputMessage] = useState("");
    const [typingUser, setTypingUser] = useState<number | null>(null);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const navigatedUser = location.state || {};

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [drawerOpen, setDrawerOpen] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const currentUser = JSON.parse(localStorage.getItem("user") || "");

    useEffect(() => {
        // Fetch data when the component mounts
        fetchData();
    }, []);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Reset selected user when pathname is "/messages"
        if (location.pathname === "/messages") {
            setSelectedUser(null);
        }

        // Update selected user if userId changes
        if (userId) {
            const user = users.find((user) => user.id === parseInt(userId));
            setSelectedUser(user || null);
        }

        // If navigatedUser is present and doesn't already exist in the users list, add it
        if (navigatedUser && navigatedUser.id) {
            const userExists = users.some((user) => user.id === navigatedUser.id);
            if (!userExists) {
                setUsers((prevUsers) => [...prevUsers, navigatedUser]);
            }
            setSelectedUser(navigatedUser);
        }
    }, [location.pathname, userId, users, navigatedUser]);

    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };
                const senderId = data.senderId;

                if (!newMessages[senderId]) {
                    newMessages[senderId] = [];
                }
                newMessages[senderId].push({
                    sender_id: data.senderId,
                    message_text: data.message_text,
                    timestamp: new Date().toISOString(),
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [currentUser]);

    const handleTyping = () => {
        if (inputMessage.trim()) {
            socket.emit("typing", {
                senderId: currentUser.id,
                receiverId: selectedUser?.id,
            });

            // Clear any previous timeout to reset typing detection
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            // Set a new timeout to stop typing after a delay (e.g., 1 second)
            const timeout = setTimeout(() => {
                socket.emit("stopTyping", {
                    senderId: currentUser.id,
                    receiverId: selectedUser?.id,
                });
            }, 3000);

            setTypingTimeout(timeout);
        }
    };

    useEffect(() => {
        socket.on("typing", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(data.senderId);
            }
        });

        socket.on("stopTyping", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(null); // Clear the typing user
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [currentUser, selectedUser]);

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
        setDrawerOpen(false);
        setSelectedUser(users.find((user) => user.id === userId) || null);
        navigate(`/messages/${userId}`);
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedUser) return;

        // Prepare the message data
        const newMessage = {
            sender_id: currentUser.id,
            message_text: inputMessage,
            timestamp: new Date().toISOString(),
        };

        // Update the local messages immediately
        setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };
            if (!newMessages[selectedUser.id]) {
                newMessages[selectedUser.id] = [];
            }
            newMessages[selectedUser.id].push(newMessage);
            return newMessages;
        });

        // Emit the message through the socket
        socket.emit("sendMessage", {
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            text: inputMessage,
        });

        socket.emit("stopTyping", {
            senderId: currentUser.id,
            receiverId: selectedUser?.id,
        });

        // Clear the input field after sending the message
        setInputMessage("");
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* Users List */}
            {isMobile ? (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": { border: "none", boxShadow: "none" },
                    }}
                >
                    <Box sx={{ width: 300, backgroundColor: "#111111", color: "white", height: "100%" }}>
                        <IconButton sx={{ position: "absolute", right: 5, top: 15 }} onClick={() => setDrawerOpen(false)}>
                            <ChevronLeftIcon sx={{ color: "white" }} />
                        </IconButton>
                        <Typography variant="h6" sx={{ p: "20px" }}>
                            Messages
                        </Typography>
                        <List>
                            {users.map((user) => {
                                const userMessages = messages[user.id] || [];
                                const lastMessage = userMessages[userMessages.length - 1];
                                const lastMessageText = lastMessage ? lastMessage.message_text : "No messages yet";
                                return (
                                    <ListItem
                                        sx={{
                                            backgroundColor: selectedUser?.id === user.id ? "#202327" : "transparent",
                                            padding: "12px",
                                            mb: 1,
                                            textAlign: "left",
                                            width: "100%",
                                            border: "none",
                                            position: "relative",
                                        }}
                                        component="button"
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={user.profile_picture || "https://via.placeholder.com/40"} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.username}
                                            secondary={
                                                <Typography variant="body2" sx={{ color: "#aaa" }}>
                                                    {lastMessageText}
                                                </Typography>
                                            }
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: "0",
                                                bottom: "0",
                                                width: "3px",
                                                backgroundColor: "#1976D2",
                                                visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>
            ) : (
                <Box
                    sx={{
                        width: { sm: "250px", md: "300px", lg: "350px" },
                        backgroundColor: "#000000",
                        color: "white",
                        borderRight: "1px solid #202327",
                    }}
                >
                    <Typography variant="h6" sx={{ p: 3 }}>
                        Messages
                    </Typography>
                    <List>
                        {users?.map((user) => {
                            const userMessages = messages[user.id] || [];
                            const lastMessage = userMessages[userMessages.length - 1];
                            const lastMessageText = lastMessage ? lastMessage.message_text : "No messages yet";
                            return (
                                <ListItem
                                    component="button"
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    sx={{
                                        backgroundColor: selectedUser?.id === user.id ? "#202327" : "transparent",
                                        padding: "12px",
                                        mb: 1,
                                        textAlign: "left",
                                        width: "100%",
                                        border: "none",
                                        position: "relative",
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{ width: "50px", height: "50px", mr: "12px" }}
                                            src={user.profile_picture || "https://via.placeholder.com/40"}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user.username}
                                        secondary={
                                            <Typography variant="body2" sx={{ color: "#aaa" }}>
                                                {lastMessageText}
                                            </Typography>
                                        }
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: "0",
                                            bottom: "0",
                                            width: "3px",
                                            backgroundColor: "#1976D2",
                                            visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            )}

            {isMobile && (
                <IconButton sx={{ position: "absolute", left: 5, top: 15 }} onClick={() => setDrawerOpen(true)}>
                    <ChevronRightIcon sx={{ color: "white" }} />
                </IconButton>
            )}

            {/* Messages Panel */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: "#000000", color: "white" }}>
                {selectedUser && (
                    <Box
                        sx={{
                            backgroundColor: "#000000",
                            padding: "15px",
                            display: "flex",
                            alignItems: "center",
                            borderBottom: "1px solid #202327",
                        }}
                    >
                        <Avatar
                            sx={{ width: "40px", height: "40px", mr: 2, cursor: "pointer", ml: isMobile ? "40px" : null }}
                            src={selectedUser.profile_picture}
                            onClick={() => navigate(`/profile/${selectedUser?.id}`)}
                        />
                        <Typography sx={{ cursor: "pointer" }} variant="h6" onClick={() => navigate(`/profile/${selectedUser?.id}`)}>
                            {selectedUser.username}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, padding: 2, overflowY: "auto", display: "flex", flexDirection: "column", paddingBottom: "50px" }}>
                    {selectedUser ? (
                        messages[selectedUser.id]?.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{ display: "flex", justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start", mb: 1 }}
                            >
                                <Typography
                                    sx={{
                                        backgroundColor: msg.sender_id === currentUser.id ? "#1976d2" : "#202327",
                                        padding: "8px 12px",
                                        borderRadius: "12px",
                                        maxWidth: "70%",
                                        fontSize: isMobile ? "0.8rem" : "1rem",
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
                    {/* This empty div will act as the scroll anchor */}
                    <div ref={messagesEndRef} />
                </Box>

                {typingUser === selectedUser?.id && <div className="dot-falling"></div>}

                {selectedUser && (
                    <Box sx={{ display: "flex", padding: 2, mb: isMobile ? "60px" : null }}>
                        <TextField
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
                            fullWidth
                            placeholder="Type a message..."
                            value={inputMessage}
                            onChange={(e) => {
                                setInputMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Prevents the default Enter key behavior (like adding a new line)
                                    if (inputMessage.trim()) {
                                        handleSendMessage();
                                    }
                                }
                            }}
                        />

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
