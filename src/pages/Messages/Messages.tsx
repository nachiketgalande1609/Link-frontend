import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../../services/socket";
import { useGlobalStore } from "../../store/store";
import { deleteMessage, getAllMessageUsersData, getMessagesDataForSelectedUser, shareChatMedia } from "../../services/api";
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
    reactions?: Record<number, string> | null;
    post?: {
        post_id: number;
        file_url: string;
        media_width: number;
        media_height: number;
        content: string;
        owner: {
            user_id: number;
            username: string;
            profile_picture: string;
        };
    } | null;
};

type MessagesType = Record<string, Message>;

type User = {
    id: number;
    username: string;
    profile_picture: string;
    isOnline: boolean;
    latest_message: string;
    latest_message_timestamp: string;
    unread_count: number;
};

interface MessageProps {
    onlineUsers: string[];
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    handleVideoCall: () => void;
}

const Messages: React.FC<MessageProps> = ({ onlineUsers, selectedUser, setSelectedUser, handleVideoCall }) => {
    const { userId } = useParams();
    const notifications = useNotifications();
    const { unreadMessagesCount, setUnreadMessagesCount } = useGlobalStore();

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [users, setUsers] = useState<User[]>([]);
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
            const res = await getAllMessageUsersData();
            const users = res.data;
            setUsers(users);
        } catch (error) {
            console.error("Failed to fetch users and messages:", error);
        }
    };

    const fetchMessagesForSelectedUser = async () => {
        if (!selectedUser) return;

        try {
            const res = await getMessagesDataForSelectedUser(selectedUser.id);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch users and messages:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    useEffect(() => {
        if (userId && selectedUser) {
            fetchMessagesForSelectedUser();
        }
    }, [userId, selectedUser]);

    // Socket for receiving messages
    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages: MessagesType) => {
                const newMessages = { ...prevMessages };
                const senderId = String(data.senderId); // Ensure key is a string

                // If the message already exists, return without updating
                if (newMessages[senderId]?.message_id === data.messageId) {
                    return prevMessages;
                }

                // Otherwise, add the new message
                newMessages[senderId] = {
                    message_id: data.messageId,
                    sender_id: data.senderId,
                    message_text: data.message_text,
                    timestamp: new Date().toISOString(),
                    saved: !!data.message_id,
                    file_url: data?.fileUrl || null,
                    file_name: data?.fileName || null,
                    file_size: data?.fileSize || null,
                    reply_to: data?.replyTo || null,
                    media_width: data?.mediaWidth || null,
                    media_height: data?.mediaHeight || null,
                    delivered: false, // Assuming the new message isn't delivered yet
                    read: false, // Assuming it's unread
                    reactions: null,
                    post: null,
                };

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
        setMessages({});
        setDrawerOpen(false);
        setSelectedUser(users.find((user) => user.id === userId) || null);
        fetchMessagesForSelectedUser();
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, unread_count: 0 } : user)));
        navigate(`/messages/${userId}`);
    };

    // Socket to send messages and emit stop typing
    const handleSendMessage = async () => {
        if ((!inputMessage.trim() && !selectedFile) || !selectedUser) return;

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

        const newMessage: Message = {
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
            delivered: false,
            read: false,
            delivered_timestamp: null,
            read_timestamp: null,
            reply_to: selectedMessageForReply?.message_id || null,
            reactions: null,
            post: null,
        };

        setMessages((prevMessages: MessagesType) => {
            const newMessages = { ...prevMessages };

            // If the message doesn't exist, add it
            if (newMessages[selectedUser.id]?.message_id !== tempMessageId) {
                newMessages[selectedUser.id] = newMessage;
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
            const response = await deleteMessage(message.message_id);
            if (response?.success) {
                setMessages((prevMessages: MessagesType) => {
                    const updatedMessages = { ...prevMessages };
                    const chatPartnerId = message.sender_id === currentUser.id ? selectedUser?.id : message.sender_id;

                    if (chatPartnerId && updatedMessages[chatPartnerId]?.message_id === message.message_id) {
                        delete updatedMessages[chatPartnerId]; // Remove the message object
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
            setMessages((prevMessages: MessagesType) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    if (newMessages[userId]?.message_id === data.tempId) {
                        newMessages[userId] = {
                            ...newMessages[userId],
                            message_id: data.messageId,
                            saved: true,
                        };
                    }
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
            setMessages((prevMessages: MessagesType) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((key) => {
                    if (newMessages[key].message_id === data.messageId) {
                        newMessages[key] = {
                            ...newMessages[key],
                            delivered: true,
                            delivered_timestamp: data.deliveredTimestamp,
                        };
                    }
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
            console.log("xxx", messages);

            const message = messages[selectedUser.id];

            if (message.sender_id === selectedUser.id && !message.read) {
                socket.emit("messageRead", {
                    senderId: selectedUser.id,
                    receiverId: currentUser.id,
                    messageIds: [message.message_id],
                });

                setMessages((prevMessages: MessagesType) => ({
                    ...prevMessages,
                    [selectedUser.id]: { ...prevMessages[selectedUser.id], read: true },
                }));

                const newUnreadCount = Math.max((unreadMessagesCount || 0) - 1, 0);
                setUnreadMessagesCount(newUnreadCount);
            }
        }
    }, [selectedUser, messages]);

    useEffect(() => {
        socket.on("messageRead", (data: { receiverId: number; messageIds: { messageId: number; readTimestamp: string }[] }) => {
            setMessages((prevMessages: MessagesType) => {
                const updatedMessages = { ...prevMessages };

                const message = updatedMessages[data.receiverId];

                if (message && data.messageIds.some((m) => m.messageId === message.message_id)) {
                    const readMessage = data.messageIds.find((m) => m.messageId === message.message_id);

                    updatedMessages[data.receiverId] = {
                        ...message,
                        read: true,
                        read_timestamp: readMessage?.readTimestamp || message.read_timestamp,
                    };
                }

                return updatedMessages;
            });
        });

        return () => {
            socket.off("messageRead");
        };
    }, []);

    const handleReaction = (messageId: number, reaction: string) => {
        if (!selectedUser) return;

        setMessages((prevMessages) => {
            const updatedMessages = { ...prevMessages };

            const message = updatedMessages[selectedUser.id];

            if (message && message.message_id === messageId) {
                updatedMessages[selectedUser.id] = {
                    ...message,
                    reactions: {
                        ...(message.reactions || {}), // Ensure reactions is not null
                        [currentUser.id]: reaction,
                    },
                };
            }

            return updatedMessages;
        });

        socket.emit("send-reaction", { messageId, senderUserId: currentUser.id, reaction });
    };

    socket.on("reaction-received", ({ messageId, senderUserId, reaction }) => {
        console.log(senderUserId);

        setMessages((prevMessages) => {
            const updatedMessages = { ...prevMessages };

            const message = updatedMessages[senderUserId];

            if (message && message.message_id === messageId) {
                updatedMessages[senderUserId] = {
                    ...message,
                    reactions: {
                        ...(message.reactions || {}), // Ensure reactions is not null
                        [senderUserId]: reaction,
                    },
                };
            }

            return updatedMessages;
        });
    });

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
                {selectedUser && (
                    <MessagesTopBar selectedUser={selectedUser} chatTheme={chatTheme} setChatTheme={setChatTheme} openVideoCall={handleVideoCall} />
                )}

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
                    handleReaction={handleReaction}
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
