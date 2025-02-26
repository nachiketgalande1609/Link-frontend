import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Typography, Box, useMediaQuery, useTheme, IconButton, Dialog, DialogTitle, Button, DialogContent, Grid } from "@mui/material";
import { ChevronLeft, MoreVert } from "@mui/icons-material";
import bg1 from "../../static/bg1.jpg";
import bg2 from "../../static/bg2.jpg";
import bg3 from "../../static/bg3.png";
import bg4 from "../../static/bg4.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideoCamera } from "@fortawesome/free-solid-svg-icons";

interface messagesTopBarProps {
    selectedUser: User | null;
    chatTheme: string;
    setChatTheme: (theme: string) => void;
    openVideoCall: () => void;
}
type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

const themeBackgrounds = ["black", `url(${bg1})`, `url(${bg2})`, `url(${bg3})`, `url(${bg4})`];

const MessagesTopBar: React.FC<messagesTopBarProps> = ({ selectedUser, chatTheme, setChatTheme, openVideoCall }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [openThemeDialog, setOpenThemeDialog] = useState(false);
    const [openColorDialog, setOpenColorDialog] = useState(false);

    return (
        <Box
            sx={{
                backgroundColor: "rgb(0,0,0,0.65)",
                padding: isMobile ? "15px 15px 15px 25px" : "15px 15px 15px 5px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #202327",
                justifyContent: "space-between",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {!isMobile && (
                    <IconButton onClick={() => navigate("/messages")} sx={{ color: "white", mr: 1, ":hover": { backgroundColor: "transparent" } }}>
                        <ChevronLeft />
                    </IconButton>
                )}
                <Avatar
                    sx={{ width: "40px", height: "40px", mr: 1, cursor: "pointer", ml: isMobile ? "20px" : null }}
                    src={selectedUser?.profile_picture}
                    onClick={() => navigate(`/profile/${selectedUser?.id}`)}
                />
                <Typography
                    sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "white" }}
                    onClick={() => navigate(`/profile/${selectedUser?.id}`)}
                >
                    {selectedUser?.username}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
                <IconButton onClick={openVideoCall} sx={{ padding: 0 }}>
                    <FontAwesomeIcon icon={faVideoCamera} size="xs" /> {/* Change size here */}
                </IconButton>
                <IconButton onClick={() => setOpenThemeDialog(true)} sx={{ padding: 0 }}>
                    <MoreVert sx={{ fontSize: "22px" }} />
                </IconButton>
            </Box>

            {/* Theme Settings Dialog */}
            <Dialog
                open={openThemeDialog}
                onClose={() => setOpenThemeDialog(false)}
                fullWidth
                maxWidth="xs"
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "20px",
                        backgroundColor: "rgba(32, 35, 39, 0.9)",
                        color: "white",
                        textAlign: "center",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Button
                    fullWidth
                    onClick={() => {
                        setOpenColorDialog(true);
                        setOpenThemeDialog(false);
                    }}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                        borderBottom: "1px solid #505050",
                    }}
                >
                    Set Theme Color
                </Button>
                <Button
                    fullWidth
                    onClick={() => setOpenThemeDialog(false)}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        backgroundColor: "#202327",
                        textTransform: "none",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#2e3238" },
                    }}
                >
                    Cancel
                </Button>
            </Dialog>

            {/* Color Picker Dialog */}
            <Dialog
                open={openColorDialog}
                onClose={() => setOpenColorDialog(false)}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "#000000",
                        color: "#fff",
                        borderRadius: "20px",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <DialogTitle sx={{ color: "#fff" }}>Select a Background</DialogTitle>
                <DialogContent>
                    <Grid container spacing={isMobile ? 0 : 2}>
                        {themeBackgrounds.map((background, index) => (
                            <Grid item xs={3} key={index}>
                                <Box
                                    sx={{
                                        width: isMobile ? 60 : 80,
                                        height: isMobile ? 60 : 80,
                                        background: background === "black" ? "black" : background,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        border: chatTheme === background ? "3px solid #fff" : "1px solid #444",
                                        boxShadow: chatTheme === background ? "0 0 8px rgba(255,255,255,0.5)" : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: background === "black" ? "#fff" : "transparent",
                                        mb: 2,
                                    }}
                                    onClick={() => {
                                        localStorage.setItem("chatTheme", background);
                                        setChatTheme(background);
                                        setOpenColorDialog(false);
                                        setOpenThemeDialog(false);
                                    }}
                                >
                                    <Typography sx={{ fontSize: "0.9rem" }}>{background === "black" && "Default"}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <Button
                    fullWidth
                    onClick={() => setOpenColorDialog(false)}
                    sx={{
                        padding: "10px",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        textTransform: "none",
                        borderRadius: "0 0 20px 20px ",
                        borderTop: "1px solid #505050",
                        "&:hover": { backgroundColor: "rgb(0,0,0,0.2)" },
                    }}
                >
                    Cancel
                </Button>
            </Dialog>
        </Box>
    );
};

export default MessagesTopBar;
