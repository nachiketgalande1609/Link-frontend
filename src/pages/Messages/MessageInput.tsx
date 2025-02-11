import React from "react";
import { Box, TextField, IconButton, CircularProgress, useMediaQuery, useTheme, Typography } from "@mui/material";
import {
    Send as SendIcon,
    AttachFileOutlined as AttachFileIcon,
    CancelOutlined as DeleteIcon,
    InsertDriveFile as FileIcon,
} from "@mui/icons-material";

type Message = {
    message_id?: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    file_url?: string;
    file_name: string | null;
    file_size: string | null;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
};

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
    cancelReply,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
                padding: 2,
                borderTop: selectedFileURL ? "1px solid #202327" : null,
                position: "relative",
            }}
        >
            {/* File Preview */}
            {selectedFile && selectedFileURL && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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

            <Box sx={{ display: "flex", alignItems: "center", mb: isMobile ? "50px" : null }}>
                <TextField
                    fullWidth
                    placeholder="Type a message..."
                    size={isMobile ? "small" : "medium"}
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
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="upload-file"
                    disabled={!!(selectedFile || selectedFileURL)}
                />
                <label htmlFor="upload-file">
                    <IconButton color="primary" component="span" disabled={!!(selectedFile || selectedFileURL)}>
                        <AttachFileIcon />
                    </IconButton>
                </label>

                <IconButton onClick={handleSendMessage} color="primary" disabled={isSendingMessage}>
                    {isSendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
            </Box>
        </Box>
    );
};

export default MessageInput;
