import React, { useState, useEffect, useRef } from "react";

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
    Badge,
    CircularProgress,
} from "@mui/material";
import {
    Send as SendIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon,
    AccessTime as AccessTimeIcon,
    PhotoCamera as PhotoCameraIcon,
    CancelOutlined as DeleteIcon,
} from "@mui/icons-material";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../../services/socket";
import { useUser } from "../../context/userContext";
import { getAllMessagesData, shareChatMedia } from "../../services/api";
import ImageDialog from "./ImageDialog";

type Message = {
    message_id?: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    image_url?: string;
};
type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string; isOnline: Boolean };

interface MessageProps {
    onlineUsers: string[];
}

const Messages: React.FC<MessageProps> = ({ onlineUsers }) => {
    const { userId } = useParams();
    const { unreadMessagesCount, setUnreadMessagesCount } = useUser();

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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileURL, setSelectedFileURL] = useState<string>("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    const navigatedUser = location.state || {};
    const currentUser = JSON.parse(localStorage.getItem("user") || "");

    // Fetch messages initially
    const fetchData = async () => {
        try {
            const res = await getAllMessagesData(currentUser.id);
            const users = res.data.users;
            let messages = res.data.messages;

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
                    fetchData();
                    newMessages[senderId] = [];
                }

                const messageExists = newMessages[senderId].some((message) => message.message_id === data.messageId);

                if (!messageExists) {
                    newMessages[senderId].push({
                        message_id: data.messageId,
                        sender_id: data.senderId,
                        message_text: data.message_text,
                        timestamp: new Date().toISOString(),
                        saved: !!data.message_id,
                        image_url: data?.imageUrl,
                    });
                }

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
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedUser) return;

        let imageUrl = null;

        if (selectedFile) {
            const formData = new FormData();
            formData.append("image", selectedFile);

            try {
                setIsSendingMessage(true);
                const response = await shareChatMedia(formData);
                imageUrl = response?.data?.imageUrl;
            } catch (error) {
                console.error("Image upload failed:", error);
                setIsSendingMessage(false);
                return;
            }
        }

        const tempMessageId = Date.now() + Math.floor(Math.random() * 1000);

        const newMessage = {
            message_id: tempMessageId,
            sender_id: currentUser.id,
            message_text: inputMessage,
            image_url: imageUrl,
            timestamp: new Date().toISOString(),
            saved: false,
        };

        setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };

            if (!newMessages[selectedUser.id]) {
                newMessages[selectedUser.id] = [];
            }

            if (!newMessages[selectedUser.id].some((msg) => msg.message_id === tempMessageId)) {
                newMessages[selectedUser.id].push(newMessage);
            }

            return newMessages;
        });

        setSelectedFile(null);
        setSelectedFileURL("");

        socket.emit("sendMessage", {
            tempId: tempMessageId,
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            text: inputMessage,
            imageUrl,
        });

        socket.emit("stopTyping", {
            senderId: currentUser.id,
            receiverId: selectedUser?.id,
        });

        setInputMessage("");
        setIsSendingMessage(false);
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

                    const newUnreadCount = Math.max((unreadMessagesCount || 0) - unreadMessages.length, 0);
                    setUnreadMessagesCount(newUnreadCount);
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);

            const fileUrl = URL.createObjectURL(file);
            setSelectedFileURL(fileUrl);
        }
    };

    const handleImageClick = (imageUrl: string | undefined) => {
        setSelectedImage(imageUrl || "");
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedImage("");
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
                                const isOnline = onlineUsers.includes(user.id.toString());
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
                                        <ListItemAvatar sx={{ position: "relative" }}>
                                            <Avatar src={user.profile_picture || "https://via.placeholder.com/40"} />
                                            <Box
                                                sx={{
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "50%",
                                                    backgroundColor: isOnline ? "#54ff54" : "gray",
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 10,
                                                    border: "2px solid #000",
                                                }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.username}
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                                >
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
                            const unreadCount = userMessages.filter((msg) => msg.sender_id === user.id && !msg.read).length;
                            const isOnline = onlineUsers.includes(user.id.toString());

                            return (
                                <ListItem
                                    component="button"
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    sx={{
                                        backgroundColor: selectedUser?.id === user.id ? "#202327" : unreadCount ? "hsl(213, 77%,10%)" : "transparent",
                                        padding: "12px",
                                        mb: 1,
                                        textAlign: "left",
                                        width: "100%",
                                        border: "none",
                                        position: "relative",
                                    }}
                                >
                                    <ListItemAvatar sx={{ position: "relative" }}>
                                        <Avatar
                                            sx={{ width: "50px", height: "50px", mr: "12px" }}
                                            src={user.profile_picture || "https://via.placeholder.com/40"}
                                        />
                                        <Box
                                            sx={{
                                                width: "12px",
                                                height: "12px",
                                                borderRadius: "50%",
                                                backgroundColor: isOnline ? "#54ff54" : "gray",
                                                position: "absolute",
                                                bottom: 0,
                                                right: 10,
                                                border: "1px solid #000",
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<Typography sx={{ fontSize: "1rem" }}>{user.username}</Typography>}
                                        secondary={
                                            <Typography
                                                sx={{
                                                    fontSize: "0.8rem",
                                                    color: "#aaa",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {lastMessageText}
                                            </Typography>
                                        }
                                    />

                                    {/* Unread Messages Badge */}
                                    {unreadCount > 0 && (
                                        <Badge
                                            badgeContent={unreadCount}
                                            color="primary"
                                            sx={{
                                                position: "absolute",
                                                right: "25px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                            }}
                                        />
                                    )}

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
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: "#000000", color: "white", width: "100px" }}>
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
                        <Typography
                            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                            variant="h6"
                            onClick={() => navigate(`/profile/${selectedUser?.id}`)}
                        >
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
                                    mb: 1,
                                    flexDirection: "column",
                                    alignItems: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                }}
                            >
                                {msg.image_url && (
                                    <Box
                                        sx={{
                                            width: "200px",
                                            minHeight: "100px",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginTop: "5px",
                                            marginBottom: "10px",
                                            backgroundColor: "#111",
                                            overflow: "hidden",
                                            borderRadius: "10px",
                                            position: "relative",
                                        }}
                                        onClick={() => handleImageClick(msg.image_url)}
                                    >
                                        <CircularProgress
                                            sx={{
                                                position: "absolute",
                                                visibility: "visible",
                                            }}
                                        />
                                        <img
                                            src={msg.image_url}
                                            alt="Sent Image"
                                            style={{
                                                maxWidth: "100%",
                                                height: "auto",
                                                objectFit: "contain",
                                                borderRadius: "10px",
                                                visibility: "hidden",
                                            }}
                                            onLoad={(e) => {
                                                const imgElement = e.target as HTMLImageElement;
                                                const loader = imgElement.previousSibling as HTMLElement;

                                                imgElement.style.visibility = "visible";
                                                loader.style.visibility = "hidden";
                                            }}
                                        />
                                    </Box>
                                )}

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                        width: "100%",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            backgroundColor: msg.sender_id === currentUser.id ? "#1976d2" : "#202327",
                                            padding: "8px 12px",
                                            borderRadius: "12px",
                                            maxWidth: "70%",
                                            fontSize: isMobile ? "0.8rem" : "1rem",
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                        }}
                                    >
                                        <span>{msg.message_text}</span>
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "#bbb",
                                                marginTop: "4px",
                                                alignSelf: msg.sender_id === currentUser.id ? "flex-start" : "flex-end",
                                            }}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                                        </span>

                                        {msg.sender_id === currentUser.id ? (
                                            // Tail for the sender (points right)
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "-8px", // Tail points right for the sender
                                                    transform: "translateY(-50%)",
                                                    width: "0",
                                                    height: "0",
                                                    borderLeft: "8px solid transparent",
                                                    borderRight: "8px solid transparent",
                                                    borderTop: "8px solid #1976d2", // Tail color for sender
                                                }}
                                            />
                                        ) : (
                                            // Tail for the receiver (points left)
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    left: "-8px", // Tail points left for the receiver
                                                    transform: "translateY(-50%)",
                                                    width: "0",
                                                    height: "0",
                                                    borderLeft: "8px solid transparent",
                                                    borderRight: "8px solid transparent",
                                                    borderTop: "8px solid #202327", // Tail color for receiver
                                                }}
                                            />
                                        )}
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            padding: 2,
                            borderTop: selectedFileURL ? "1px solid #202327" : null,
                            position: "relative",
                        }}
                    >
                        {/* If an image is attached, display it above the text field */}
                        {selectedFile && selectedFileURL && (
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                <img
                                    src={selectedFileURL}
                                    alt="Attached"
                                    style={{
                                        maxWidth: "200px",
                                        borderRadius: "8px",
                                        marginTop: "5px",
                                        marginBottom: "10px",
                                    }}
                                />
                                {/* Discard button */}
                                <IconButton
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setSelectedFileURL("");
                                    }}
                                    sx={{
                                        position: "absolute",
                                        top: 5,
                                        right: 5,
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                        color: "white",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", mb: isMobile ? "60px" : null }}>
                            <TextField
                                fullWidth
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={(e) => {
                                    setInputMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                    },
                                }}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                id="upload-image"
                                disabled={!!(selectedFile || selectedFileURL)}
                            />
                            <label htmlFor="upload-image">
                                <IconButton color="primary" component="span" disabled={!!(selectedFile || selectedFileURL)}>
                                    <PhotoCameraIcon />
                                </IconButton>
                            </label>

                            <IconButton onClick={handleSendMessage} color="primary" disabled={isSendingMessage}>
                                {isSendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                            </IconButton>
                        </Box>
                    </Box>
                )}
            </Box>
            <ImageDialog openDialog={openDialog} handleCloseDialog={handleCloseDialog} selectedImage={selectedImage} />
        </Box>
    );
};

export default Messages;
