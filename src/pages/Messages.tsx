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
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../services/socket";
import api from "../services/config";

type Message = {
    message_id?: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
};
type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string };

const Messages = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<MessagesType>({});
    const [inputMessage, setInputMessage] = useState("");
    const [typingUser, setTypingUser] = useState<number | null>(null);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const navigatedUser = location.state || {};
    const currentUser = JSON.parse(localStorage.getItem("user") || "");

    // Fetch messages initially
    const fetchData = async () => {
        try {
            const res = await api.get(`/api/messages/${currentUser.id}`);
            const users = res.data.data.users;
            let messages = res.data.data.messages;

            // Ensure messages with a messageId are marked as saved
            const updatedMessages = Object.keys(messages).reduce(
                (acc, userId) => {
                    acc[userId] = messages[userId].map((msg: MessagesType) => ({
                        ...msg,
                        saved: !!msg.message_id,
                        delivered: msg.delivered,
                    }));
                    return acc;
                },
                {} as Record<string, any[]>
            ); // Explicitly typing to avoid TS issues

            setUsers(users);
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Failed to fetch users and messages:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Scroll to bottom on new message and selecting user
    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedUser]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Setting selected user
    useEffect(() => {
        if (location.pathname === "/messages") {
            setSelectedUser(null);
        }

        if (userId) {
            const user = users.find((user) => user.id === parseInt(userId));
            setSelectedUser(user || null);
        }

        if (navigatedUser && navigatedUser.id) {
            const userExists = users.some((user) => user.id === navigatedUser.id);
            if (!userExists) {
                setUsers((prevUsers) => [...prevUsers, navigatedUser]);
            }
            setSelectedUser(navigatedUser);
        }
    }, [location.pathname, userId, users, navigatedUser]);

    // Socket for receiving messages
    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };
                const senderId = data.senderId;

                if (!newMessages[senderId]) {
                    newMessages[senderId] = [];
                }
                newMessages[senderId].push({
                    message_id: data.messageId,
                    sender_id: data.senderId,
                    message_text: data.message_text,
                    timestamp: new Date().toISOString(),
                    saved: !!data.message_id,
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [currentUser]);

    // Socket for catching typing activity
    useEffect(() => {
        socket.on("typing", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(data.senderId);
            }
        });

        socket.on("stopTyping", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(null);
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [currentUser, selectedUser]);

    // Socket for emitting typing activity
    const handleTyping = () => {
        if (inputMessage.trim()) {
            socket.emit("typing", {
                senderId: currentUser.id,
                receiverId: selectedUser?.id,
            });

            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            const timeout = setTimeout(() => {
                socket.emit("stopTyping", {
                    senderId: currentUser.id,
                    receiverId: selectedUser?.id,
                });
            }, 3000);

            setTypingTimeout(timeout);
        }
    };

    // Set selected user on clicking the user's chat
    const handleUserClick = (userId: number) => {
        setDrawerOpen(false);
        setSelectedUser(users.find((user) => user.id === userId) || null);
        navigate(`/messages/${userId}`);
    };

    // Socket to send messages and emit stop typing
    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedUser) return;

        const tempMessageId = Date.now() + Math.floor(Math.random() * 1000);

        const newMessage = {
            message_id: tempMessageId,
            sender_id: currentUser.id,
            message_text: inputMessage,
            timestamp: new Date().toISOString(),
            saved: false,
        };

        setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };

            if (!newMessages[selectedUser.id]) {
                newMessages[selectedUser.id] = [];
            }

            // **Check if message already exists before adding**
            if (!newMessages[selectedUser.id].some((msg) => msg.message_id === tempMessageId)) {
                newMessages[selectedUser.id].push(newMessage);
            }

            return newMessages;
        });

        socket.emit("sendMessage", {
            tempId: tempMessageId,
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            text: inputMessage,
        });

        socket.emit("stopTyping", {
            senderId: currentUser.id,
            receiverId: selectedUser?.id,
        });

        setInputMessage("");
    };

    useEffect(() => {
        socket.on("messageSaved", (data: { tempId: number; messageId: number }) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    newMessages[userId] = newMessages[userId].map((msg) =>
                        msg.message_id === data.tempId ? { ...msg, message_id: data.messageId, saved: true } : msg
                    );
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("messageSaved");
        };
    }, []);

    useEffect(() => {
        socket.on("messageDelivered", (data: { messageId: number }) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    newMessages[userId] = newMessages[userId].map((msg) => (msg.message_id === data.messageId ? { ...msg, delivered: true } : msg));
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("messageDelivered");
        };
    }, []);

    console.log(messages);

    useEffect(() => {
        if (selectedUser && messages[selectedUser.id]) {
            const unreadMessages = messages[selectedUser.id].filter((msg) => msg.sender_id === selectedUser.id && !msg.read);

            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map((msg) => msg.message_id).filter((id) => !!id);

                if (messageIds.length > 0) {
                    socket.emit("messageRead", {
                        senderId: selectedUser.id,
                        receiverId: currentUser.id,
                        messageIds,
                    });

                    setMessages((prevMessages) => {
                        const updatedMessages = { ...prevMessages };
                        updatedMessages[selectedUser.id] = updatedMessages[selectedUser.id].map((msg) =>
                            messageIds.includes(msg.message_id) ? { ...msg, read: true } : msg
                        );
                        return updatedMessages;
                    });
                }
            }
        }
    }, [selectedUser, messages]);

    useEffect(() => {
        socket.on("messageRead", (data: { receiverId: number; messageIds: number[] }) => {
            setMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages };

                if (updatedMessages[data.receiverId]) {
                    updatedMessages[data.receiverId] = updatedMessages[data.receiverId].map((msg) =>
                        msg.message_id !== undefined && data.messageIds.includes(msg.message_id) ? { ...msg, read: true } : msg
                    );
                }

                return updatedMessages;
            });
        });

        return () => {
            socket.off("messageRead");
        };
    }, []);

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
                {/* Top bar */}
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

                {/* Messages Container */}
                <Box sx={{ flexGrow: 1, padding: 2, overflowY: "auto", display: "flex", flexDirection: "column", paddingBottom: "50px" }}>
                    {selectedUser ? (
                        messages[selectedUser.id]?.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                    mb: 1,
                                    alignItems: "center",
                                }}
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
                                {msg.sender_id === currentUser.id &&
                                    (msg.read ? (
                                        <DoneAllIcon sx={{ color: "#1DA1F2", fontSize: 16, ml: 1 }} /> // Read
                                    ) : msg.delivered ? (
                                        <DoneAllIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} /> // Delivered
                                    ) : msg.saved ? (
                                        <DoneIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} /> // Saved
                                    ) : (
                                        <AccessTimeIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} /> // Pending
                                    ))}
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", mt: 5 }}>
                            Select a user to start chatting
                        </Typography>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Typing indicator */}
                {typingUser === selectedUser?.id && <div className="dot-falling"></div>}

                {/* Message Input */}
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

                        <IconButton color="primary">
                            <SendIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Messages;
