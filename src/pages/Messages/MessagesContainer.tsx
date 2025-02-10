import React, { useState } from "react";
import { Typography, Box, CircularProgress, useMediaQuery, useTheme, Drawer, IconButton } from "@mui/material";
import { Done as DoneIcon, DoneAll as DoneAllIcon, AccessTime as AccessTimeIcon, Close as CloseIcon } from "@mui/icons-material";
import { matchesGlob } from "path";

interface MessagesContainerProps {
    selectedUser: User | null;
    messages: Record<number, Message[]>;
    currentUser: User;
    handleImageClick: (imageUrl: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

type Message = {
    message_id?: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    image_url?: string;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
};

type User = { id: number; username: string; profile_picture: string; isOnline: Boolean };

const MessagesContainer: React.FC<MessagesContainerProps> = ({ selectedUser, messages, currentUser, handleImageClick, messagesEndRef }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // State to manage the drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // Handle double click on a message
    const handleDoubleClick = (msg: Message) => {
        setSelectedMessage(msg);
        setDrawerOpen(true);
    };

    return (
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
                        onDoubleClick={() => !isMobile && handleDoubleClick(msg)}
                        onTouchStart={(e) => {
                            if (isMobile) {
                                const timeout = setTimeout(() => handleDoubleClick(msg), 500); // Long press for 500ms
                                e.currentTarget.dataset.timeout = String(timeout);
                            }
                        }}
                        onTouchEnd={(e) => {
                            if (isMobile) {
                                clearTimeout(Number(e.currentTarget.dataset.timeout));
                            }
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
                                    cursor: "pointer",
                                }}
                                onClick={() => msg.image_url && handleImageClick(msg.image_url)}
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
                            </Typography>

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
                ))
            ) : (
                <Typography variant="body2" sx={{ textAlign: "center", mt: 5 }}>
                    Select a user to start chatting
                </Typography>
            )}
            <div ref={messagesEndRef} />

            {/* Drawer for Message Details */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? "50vw" : "300px",
                        padding: 2,
                        color: "white",
                        backgroundColor: "black",
                    },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Message Details</Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {selectedMessage?.timestamp && (
                    <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                        <Box sx={{ paddingRight: "10px" }}>
                            <DoneIcon sx={{ color: "#ffffff", fontSize: "18px", top: "2px", position: "relative" }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#ffffff",
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                }}
                            >
                                <strong>Sent</strong>
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }}>
                                {new Date(selectedMessage.timestamp).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                })}
                                ,{" "}
                                {new Date(selectedMessage.timestamp).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {selectedMessage?.delivered_timestamp && (
                    <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                        <Box sx={{ paddingRight: "10px" }}>
                            <DoneAllIcon sx={{ color: "#ffffff", fontSize: "18px", top: "2px", position: "relative" }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#ffffff",
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                }}
                            >
                                <strong>Delivered</strong>
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }}>
                                {new Date(selectedMessage.delivered_timestamp).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                })}
                                ,{" "}
                                {new Date(selectedMessage.delivered_timestamp).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {selectedMessage?.read_timestamp && (
                    <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                        <Box sx={{ paddingRight: "10px" }}>
                            <DoneAllIcon sx={{ color: "#38acff", fontSize: "18px", top: "2px", position: "relative" }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#ffffff",
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                }}
                            >
                                <div>
                                    <strong>Read</strong>
                                    <br />
                                </div>
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }}>
                                {new Date(selectedMessage.read_timestamp).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                })}
                                ,{" "}
                                {new Date(selectedMessage.read_timestamp).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default MessagesContainer;
