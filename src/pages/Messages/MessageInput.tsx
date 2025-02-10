import React from "react";
import { Box, TextField, IconButton, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { Send as SendIcon, PhotoCamera as PhotoCameraIcon, CancelOutlined as DeleteIcon } from "@mui/icons-material";

type MessageInputProps = {
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    selectedFileURL: string;
    setSelectedFileURL: React.Dispatch<React.SetStateAction<string>>;
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleTyping: () => void;
    handleSendMessage: () => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSendingMessage: boolean;
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
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    );
};

export default MessageInput;
