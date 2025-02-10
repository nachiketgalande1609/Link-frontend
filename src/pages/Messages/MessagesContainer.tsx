import React from "react";
import { Typography, Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { Done as DoneIcon, DoneAll as DoneAllIcon, AccessTime as AccessTimeIcon } from "@mui/icons-material";

interface MessagesContainerProps {
    selectedUser: User | null;
    messages: Record<number, Message[]>; // ✅ Change `messages` to a record with user IDs as keys and arrays of messages
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
};

type User = { id: number; username: string; profile_picture: string; isOnline: Boolean };

const MessagesContainer: React.FC<MessagesContainerProps> = ({ selectedUser, messages, currentUser, handleImageClick, messagesEndRef }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    );
};

export default MessagesContainer;
