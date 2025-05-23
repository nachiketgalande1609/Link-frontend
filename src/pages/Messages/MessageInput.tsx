import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, CircularProgress, useMediaQuery, useTheme, Typography, Popover } from "@mui/material";
import {
    CancelOutlined as DeleteIcon,
    InsertDriveFile as FileIcon,
    Close as CloseIcon,
    SentimentSatisfiedAlt as EmojiIcon,
} from "@mui/icons-material";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

type User = {
    id: number;
    username: string;
    profile_picture: string;
    isOnline: boolean;
    latest_message: string;
    latest_message_timestamp: string;
    unread_count: number;
};

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
    reactions: ReactionDetail[];
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

interface ReactionDetail {
    user_id: string;
    reaction: string;
    username: string;
    profile_picture: string;
}

type MessageInputProps = {
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    selectedFileURL: string;
    setSelectedFileURL: React.Dispatch<React.SetStateAction<string>>;
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleTyping: () => void;
    handleSendMessage: () => Promise<void>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSendingMessage: boolean;
    selectedMessageForReply: Message | null;
    cancelReply: () => void;
    selectedUser: User | null;
};

const MessageInput: React.FC<MessageInputProps> = ({
    selectedFile,
    setSelectedFile,
    selectedFileURL,
    setSelectedFileURL,
    inputMessage,
    handleTyping,
    setInputMessage,
    handleSendMessage,
    handleFileChange,
    isSendingMessage,
    selectedMessageForReply,
    selectedUser,
    cancelReply,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const inputRef = useRef<HTMLInputElement>(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    useEffect(() => {
        if (selectedUser && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedUser]);

    const handleEmojiClick = (emojiObject: any) => {
        setInputMessage((prev) => prev + emojiObject.emoji);
        handleTyping();
    };

    // Function to determine file type
    const getFilePreview = () => {
        if (!selectedFile || !selectedFileURL) return null;

        const fileType = selectedFile.type;

        if (fileType.startsWith("image/")) {
            return <img src={selectedFileURL} alt="Attached" style={{ maxWidth: "200px", borderRadius: "8px" }} />;
        } else if (fileType.startsWith("video/")) {
            return <video src={selectedFileURL} controls style={{ maxWidth: "200px", borderRadius: "8px" }} />;
        } else if (fileType.startsWith("audio/")) {
            return <audio controls src={selectedFileURL} style={{ width: "100%" }} />;
        } else {
            return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileIcon />
                    <Typography variant="body2">{selectedFile.name}</Typography>
                </Box>
            );
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                borderTop: selectedFileURL ? "1px solid #202327" : null,
                position: "relative",
                backgroundColor: "rgb(0,0,0,0.65)",
            }}
        >
            {/* Reply Preview */}
            {selectedMessageForReply && (
                <Box
                    sx={{
                        backgroundColor: "#333",
                        padding: "6px",
                        borderLeft: "3px solid #1DA1F2",
                        borderRadius: "8px",
                        minWidth: "100px",
                        fontSize: "0.85rem",
                        color: "#ccc",
                        mb: 1,
                        cursor: "pointer",
                        position: "relative",
                        "&:hover": { backgroundColor: "#444" },
                    }}
                >
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold", color: "#1DA1F2", mb: 0.5 }}>
                        {selectedMessageForReply.sender_id === currentUser.id ? "You" : selectedUser?.username}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: "0.9rem" }}>
                        {selectedMessageForReply.message_text.length > 50
                            ? selectedMessageForReply.message_text.slice(0, 50) + "..."
                            : selectedMessageForReply.message_text}
                    </Typography>
                    <IconButton
                        onClick={cancelReply}
                        sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            color: "white",
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                </Box>
            )}

            {/* File Preview */}
            {selectedFile && selectedFileURL && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2, padding: 2 }}>
                    {getFilePreview()}
                    <IconButton
                        onClick={() => {
                            setSelectedFile(null);
                            setSelectedFileURL("");
                        }}
                        sx={{
                            position: "absolute",
                            top: 15,
                            right: 15,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                            padding: 0,
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", mb: isMobile ? "50px" : null, padding: "12px 18px", borderTop: "1px solid #202327" }}>
                <TextField
                    fullWidth
                    placeholder="Type a message..."
                    size={isMobile ? "small" : "medium"}
                    value={inputMessage}
                    variant="standard"
                    inputRef={inputRef}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (inputMessage.trim() || selectedFile) {
                                handleSendMessage();
                            }
                        }
                    }}
                    multiline
                    minRows={1}
                    maxRows={4}
                    sx={{
                        "& .MuiInput-underline:before": {
                            borderBottom: "none !important",
                        },
                        "& .MuiInput-underline:after": {
                            borderBottom: "none !important",
                        },
                        "& .MuiInput-underline:hover:before": {
                            borderBottom: "none !important",
                        },
                    }}
                />
                <IconButton onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                    <EmojiIcon />
                </IconButton>
                <Popover
                    open={Boolean(emojiAnchorEl)}
                    anchorEl={emojiAnchorEl}
                    onClose={() => setEmojiAnchorEl(null)}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                    PaperProps={{
                        sx: {
                            borderRadius: "20px",
                        },
                    }}
                >
                    <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} />
                </Popover>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="upload-file"
                    disabled={!!(selectedFile || selectedFileURL)}
                />
                <label htmlFor="upload-file">
                    <IconButton component="span" disabled={!!(selectedFile || selectedFileURL)}>
                        <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: "22px" }} />
                    </IconButton>
                </label>

                <IconButton
                    onClick={() => (inputMessage.trim() || selectedFile) && handleSendMessage()}
                    disabled={isSendingMessage || !(inputMessage.trim() || selectedFile)}
                >
                    {isSendingMessage ? <CircularProgress size={24} /> : <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "22px" }} />}
                </IconButton>
            </Box>
        </Box>
    );
};

export default MessageInput;
