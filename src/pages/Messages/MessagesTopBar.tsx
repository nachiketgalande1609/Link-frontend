import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Typography, Box, useMediaQuery, useTheme, IconButton } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

interface messagesTopBarProps {
    selectedUser: User | null;
}
type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

const MessagesTopBar: React.FC<messagesTopBarProps> = ({ selectedUser }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box
            sx={{
                backgroundColor: "#000000",
                padding: isMobile ? "15px 15px 15px 25px" : "15px 15px 15px 5px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #202327",
            }}
        >
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
            <Typography sx={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate(`/profile/${selectedUser?.id}`)}>
                {selectedUser?.username}
            </Typography>
        </Box>
    );
};

export default MessagesTopBar;
