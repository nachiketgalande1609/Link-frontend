import React, { useState, useEffect, useRef } from "react";

import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../../services/socket";
import { useGlobalStore } from "../../store/store";
import { deleteMessage, getAllMessagesData, shareChatMedia } from "../../services/api";
import ImageDialog from "../../component/ImageDialog";
import MessagesContainer from "./messageContainer/MessagesContainer";
import MessageInput from "./MessageInput";
import MessagesTopBar from "./MessagesTopBar";
import MessagesDrawer from "./MessagesDrawer";
import { useNotifications } from "@toolpad/core/useNotifications";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    file_url: string;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
    file_name: string | null;
    file_size: string | null;
    reply_to: number | null;
    media_height: number | null;
    media_width: number | null;
};

type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

interface MessageProps {
    onlineUsers: string[];
}

const Messages: React.FC<MessageProps> = ({ onlineUsers }) => {
    const { userId } = useParams();
    const notifications = useNotifications();
    const { unreadMessagesCount, setUnreadMessagesCount } = useGlobalStore();

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
    const [selectedMessageForReply, setSelectedMessageForReply] = useState<Message | null>(null);
    const [chatTheme, setChatTheme] = useState(() => localStorage.getItem("chatTheme") || "");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleReply = (msg: Message) => {
        setSelectedMessageForReply(msg);
    };

    const cancelReply = () => {
        setSelectedMessageForReply(null);
    };

    const navigatedUser = location.state || {};
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

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
    }, [messages, selectedUser, selectedMessageForReply]);

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
                        file_url: data?.fileUrl,
                        file_name: data.fileName,
                        file_size: data.fileSize,
                        reply_to: data.replyTo,
                        media_width: data.mediaWidth,
                        media_height: data.mediaHeight,
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
        if ((!inputMessage.trim() && !selectedFile) || !selectedUser) return; // Prevent sending empty messages

        let fileUrl = null;
        let fileName = null;
        let fileSize = null;
        let mediaWidth = null;
        let mediaHeight = null;

        if (selectedFile) {
            const formData = new FormData();
            formData.append("image", selectedFile);

            try {
                setIsSendingMessage(true);
                const response = await shareChatMedia(formData);
                fileUrl = response?.data?.fileUrl;
                fileName = response?.data?.fileName;
                fileSize = response?.data?.fileSize;
                mediaWidth = response?.data?.mediaWidth;
                mediaHeight = response?.data?.mediaHeight;
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
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            media_width: mediaWidth,
            media_height: mediaHeight,
            timestamp: new Date().toISOString(),
            saved: false,
            reply_to: selectedMessageForReply?.message_id || null,
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
        setSelectedMessageForReply(null);

        socket.emit("sendMessage", {
            tempId: tempMessageId,
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            text: inputMessage,
            fileUrl,
            fileName,
            fileSize,
            mediaWidth,
            mediaHeight,
            replyTo: selectedMessageForReply?.message_id || null,
        });

        socket.emit("stopTyping", {
            senderId: currentUser.id,
            receiverId: selectedUser?.id,
        });

        setInputMessage("");
        setIsSendingMessage(false);
    };

    const handleDeleteMessage = async (message: Message | null) => {
        if (!message) {
            console.error("No message to delete.");
            return;
        }

        try {
            const response = await deleteMessage(message.message_id, currentUser?.id);
            if (response?.success) {
                setMessages((prevMessages) => {
                    const updatedMessages = { ...prevMessages };
                    const chatPartnerId = message.sender_id === currentUser.id ? selectedUser?.id : message.sender_id;

                    if (chatPartnerId && updatedMessages[chatPartnerId]) {
                        updatedMessages[chatPartnerId] = updatedMessages[chatPartnerId].filter((msg) => msg.message_id !== message.message_id);
                    }

                    return updatedMessages;
                });
                notifications.show(`Message deleted successfully!`, {
                    severity: "success",
                    autoHideDuration: 3000,
                });
            }
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
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
        socket.on("messageDelivered", (data: { messageId: number; deliveredTimestamp: string | null }) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    newMessages[userId] = newMessages[userId].map((msg) =>
                        msg.message_id === data.messageId ? { ...msg, delivered: true, delivered_timestamp: data.deliveredTimestamp } : msg
                    );
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
        socket.on("messageRead", (data: { receiverId: number; messageIds: { messageId: number; readTimestamp: string }[] }) => {
            setMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages };

                if (updatedMessages[data.receiverId]) {
                    updatedMessages[data.receiverId] = updatedMessages[data.receiverId].map((msg) => {
                        const readMessage = data.messageIds.find((m) => m.messageId === msg.message_id);
                        return readMessage ? { ...msg, read: true, read_timestamp: readMessage.readTimestamp } : msg;
                    });
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

    const handleImageClick = (fileUrl: string | undefined) => {
        setSelectedImage(fileUrl || "");
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedImage("");
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <MessagesDrawer
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                users={users}
                messages={messages}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                handleUserClick={handleUserClick}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
            />

            {isMobile && (
                <IconButton sx={{ position: "absolute", left: 5, top: 15 }} onClick={() => setDrawerOpen(true)}>
                    <ChevronRightIcon sx={{ color: "white" }} />
                </IconButton>
            )}

            {/* Messages Panel */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    color: "white",
                    width: "100px",
                    backgroundImage: selectedUser ? chatTheme : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Top bar */}
                {selectedUser && <MessagesTopBar selectedUser={selectedUser} chatTheme={chatTheme} setChatTheme={setChatTheme} />}

                {/* Messages Container */}
                <MessagesContainer
                    selectedUser={selectedUser}
                    messages={messages}
                    currentUser={currentUser}
                    handleImageClick={handleImageClick}
                    messagesEndRef={messagesEndRef}
                    handleReply={handleReply}
                    chatTheme={chatTheme}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    handleDeleteMessage={handleDeleteMessage}
                />

                {/* Typing indicator */}
                {typingUser === selectedUser?.id && <div className="dot-falling"></div>}

                {/* Message Input Box*/}
                {selectedUser && (
                    <MessageInput
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        selectedFileURL={selectedFileURL}
                        setSelectedFileURL={setSelectedFileURL}
                        inputMessage={inputMessage}
                        handleTyping={handleTyping}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        handleFileChange={handleFileChange}
                        isSendingMessage={isSendingMessage}
                        selectedMessageForReply={selectedMessageForReply}
                        selectedUser={selectedUser}
                        cancelReply={cancelReply}
                    />
                )}
            </Box>
            <ImageDialog openDialog={openDialog} handleCloseDialog={handleCloseDialog} selectedImage={selectedImage} />
        </Box>
    );
};

export default Messages;
