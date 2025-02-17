import React, { useState } from "react";
import { Typography, Box, CircularProgress, useMediaQuery, useTheme, IconButton } from "@mui/material";
import {
    Done as DoneIcon,
    DoneAll as DoneAllIcon,
    AccessTime as AccessTimeIcon,
    Article as PdfIcon,
    InsertDriveFile as FolderIcon,
    Reply as ReplyIcon,
} from "@mui/icons-material";
import BlurBackgroundImage from "../../../static/blur.jpg";

import MessageDetailsDrawer from "./MessageDetailsDrawer";

interface MessagesContainerProps {
    selectedUser: User | null;
    messages: MessagesType;
    currentUser: User;
    handleImageClick: (fileUrl: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    handleReply: (msg: Message) => void;
    chatTheme: string;
}

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
    image_height: number | null;
    image_width: number | null;
};

type MessagesType = Record<string, Message[]>;

type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

const MessagesContainer: React.FC<MessagesContainerProps> = ({
    selectedUser,
    messages,
    currentUser,
    handleImageClick,
    messagesEndRef,
    handleReply,
    chatTheme,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // State to manage the drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);

    // Handle double click on a message
    const handleDoubleClick = (msg: Message) => {
        setSelectedMessage(msg);
        setDrawerOpen(true);
    };

    const findOriginalMessage = (replyToId: number | null) => {
        return Object.values(messages)
            .flat()
            .find((m) => m.message_id === replyToId);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                padding: 2,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                paddingBottom: "50px",
            }}
        >
            {selectedUser ? (
                messages[selectedUser.id]?.map((msg, index) => {
                    const originalMessage = msg.reply_to ? findOriginalMessage(msg.reply_to) : null;

                    return (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                mb: 2,
                                flexDirection: "row",
                                justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                alignItems: "end",
                            }}
                            onTouchEnd={(e) => {
                                if (isMobile) {
                                    clearTimeout(Number(e.currentTarget.dataset.timeout));
                                }
                            }}
                            onMouseEnter={() => setHoveredMessage(msg.message_id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                        >
                            <Box>
                                {msg.file_url && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginTop: "5px",
                                            backgroundImage: `url(${BlurBackgroundImage})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            overflow: "hidden",
                                            borderRadius: "10px",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {msg.file_url.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i) ? (
                                            <>
                                                <CircularProgress
                                                    sx={{
                                                        position: "absolute",
                                                        visibility: "visible",
                                                        color: "#ffffff",
                                                    }}
                                                />
                                                <Box
                                                    component="img"
                                                    src={msg.file_url}
                                                    alt="Sent Image"
                                                    sx={{
                                                        height: { xs: "200px", md: "250px", lg: "300px" },
                                                        width:
                                                            msg.image_width && msg.image_height
                                                                ? {
                                                                      xs: "auto",
                                                                      md: `${(msg.image_width / msg.image_height) * 250}px`,
                                                                      lg: `${(msg.image_width / msg.image_height) * 300}px`,
                                                                  }
                                                                : "auto",
                                                        objectFit: "contain",
                                                        borderRadius: "10px",
                                                        visibility: "hidden",
                                                    }}
                                                    onLoad={(e) => {
                                                        const imgElement = e.target as HTMLImageElement;
                                                        const loader = imgElement.previousSibling as HTMLElement;

                                                        imgElement.style.visibility = "visible";
                                                        if (loader) loader.style.display = "none";
                                                    }}
                                                    onClick={() => msg.file_url && handleImageClick(msg.file_url)}
                                                />
                                            </>
                                        ) : msg.file_url.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video
                                                controls
                                                style={{
                                                    maxWidth: "100%",
                                                    height: "auto",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <source src={msg.file_url} />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : msg.file_url.match(/\.pdf$/i) ? (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    width: "300px",
                                                    backgroundColor: "#202327",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        width: "100%",
                                                        backgroundColor: "#202327",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => window.open(msg.file_url, "_blank", "noopener,noreferrer")}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                            padding: 1.5,
                                                            borderRadius: 2,
                                                            border: "1px solid #505050",
                                                            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                                                            margin: "6px",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <PdfIcon sx={{ color: "#d32f2f", fontSize: 40 }} />
                                                        {msg.file_name && (
                                                            <Typography fontSize={14} color="text.secondary">
                                                                .{msg.file_name.split(".").pop()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ flex: 1, overflow: "hidden", padding: "8px 8px 4px 8px" }}>
                                                    <Typography
                                                        fontWeight={500}
                                                        sx={{
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "100%",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {msg.file_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {msg.file_size
                                                            ? Number(msg.file_size) < 1024 * 1024
                                                                ? (Number(msg.file_size) / 1024).toFixed(2) + " KB"
                                                                : (Number(msg.file_size) / (1024 * 1024)).toFixed(2) + " MB"
                                                            : "N/A"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: "flex", flexDirection: "column", width: "300px", backgroundColor: "#202327" }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        padding: 1.5,
                                                        borderRadius: 2,
                                                        border: "1px solid #505050",
                                                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                                                        margin: "6px",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => {
                                                        const link = document.createElement("a");
                                                        link.href = msg.file_url;
                                                        link.download = ""; // Allows the browser to handle the filename
                                                        link.rel = "noopener noreferrer";
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                >
                                                    <FolderIcon sx={{ color: "#ffd014", fontSize: 40 }} />
                                                    {msg.file_name && (
                                                        <Typography fontSize={14} color="text.secondary">
                                                            .{msg.file_name.split(".").pop()}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Box sx={{ flex: 1, overflow: "hidden", padding: "8px 8px 4px 8px" }}>
                                                    <Typography
                                                        fontWeight={500}
                                                        sx={{
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "100%",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {msg.file_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {msg.file_size
                                                            ? Number(msg.file_size) < 1024 * 1024
                                                                ? (Number(msg.file_size) / 1024).toFixed(2) + " KB"
                                                                : (Number(msg.file_size) / (1024 * 1024)).toFixed(2) + " MB"
                                                            : "N/A"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                {originalMessage && (
                                    <Box
                                        sx={{
                                            backgroundColor: "#333",
                                            padding: "6px",
                                            borderLeft: "3px solid #1DA1F2",
                                            borderRadius: "8px",
                                            maxWidth: "70%",
                                            minWidth: "100px",
                                            fontSize: "0.85rem",
                                            color: "#ccc",
                                            mb: 1,
                                            cursor: "pointer",
                                            "&:hover": { backgroundColor: "#444" },
                                        }}
                                        onClick={() => {
                                            const messageElement = document.getElementById(`msg-${originalMessage.message_id}`);
                                            if (messageElement) {
                                                messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

                                                // Highlighting effect
                                                setHighlightedMessageId(originalMessage.message_id);

                                                setTimeout(() => {
                                                    setHighlightedMessageId(null);
                                                }, 2000);
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: "bold", color: "#1DA1F2" }}>
                                            {originalMessage.sender_id === currentUser.id ? "You" : selectedUser.username}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: "0.8rem" }}>
                                            {originalMessage.message_text.length > 50
                                                ? originalMessage.message_text.slice(0, 50) + "..."
                                                : originalMessage.message_text}
                                        </Typography>
                                    </Box>
                                )}

                                <Box
                                    id={`msg-${msg.message_id}`}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                        width: "100%",
                                        transition: "background-color 0.5s ease-in-out",
                                        backgroundColor: highlightedMessageId === msg.message_id ? "#0b335b" : "transparent",
                                        borderRadius: "12px",
                                        position: "relative",
                                    }}
                                >
                                    {msg?.message_text && (
                                        <Typography
                                            sx={{
                                                backgroundColor: msg.sender_id === currentUser.id ? "#1976d2" : "#202327",
                                                padding: "8px 12px",
                                                borderRadius: "12px",
                                                maxWidth: isMobile ? "70vw" : { lg: "40vw", md: "30vw", sm: "30vw", xs: "20vw" },
                                                fontSize: isMobile ? "0.8rem" : "1rem",
                                                wordWrap: "break-word",
                                                whiteSpace: "normal",
                                                display: "flex",
                                                flexDirection: "column",
                                                position: "relative",
                                            }}
                                            onDoubleClick={() => !isMobile && handleDoubleClick(msg)}
                                            onTouchStart={(e) => {
                                                if (isMobile) {
                                                    const timeout = setTimeout(() => handleDoubleClick(msg), 500); // Long press for 500ms
                                                    e.currentTarget.dataset.timeout = String(timeout);
                                                }
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
                                            {hoveredMessage === msg.message_id && (
                                                <IconButton
                                                    sx={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        left: msg.sender_id === currentUser.id ? "-40px" : "auto",
                                                        right: msg.sender_id === currentUser.id ? "auto" : "-40px",
                                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                                        color: "white",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                        },
                                                    }}
                                                    onClick={() => handleReply(msg)}
                                                >
                                                    <ReplyIcon />
                                                </IconButton>
                                            )}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ paddingBottom: "2px" }}>
                                {msg.sender_id === currentUser.id &&
                                    (msg.read ? (
                                        <DoneAllIcon sx={{ color: "#1DA1F2", fontSize: 16, ml: 1 }} />
                                    ) : msg.delivered ? (
                                        <DoneAllIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} />
                                    ) : msg.saved ? (
                                        <DoneIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} />
                                    ) : (
                                        <AccessTimeIcon sx={{ color: "#aaa", fontSize: 16, ml: 1 }} />
                                    ))}
                            </Box>
                        </Box>
                    );
                })
            ) : (
                <Typography variant="body2" sx={{ textAlign: "center", mt: 5 }}>
                    Select a user to start chatting
                </Typography>
            )}
            <div ref={messagesEndRef} />

            {/* Drawer for Message Details */}
            <MessageDetailsDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} selectedMessage={selectedMessage} />
        </Box>
    );
};

export default MessagesContainer;
