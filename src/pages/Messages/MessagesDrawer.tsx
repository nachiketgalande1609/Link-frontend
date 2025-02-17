import React, { useEffect, useState } from "react";
import {
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Box,
    IconButton,
    useMediaQuery,
    useTheme,
    Drawer,
    Badge,
} from "@mui/material";
import {
    ChevronLeft as ChevronLeftIcon,
    PersonAdd as PersonAddIcon,
    InsertDriveFile,
    Image,
    VideoLibrary,
    MusicNote,
    Description,
} from "@mui/icons-material";
import { getFollowingUsers } from "../../services/api";
import NewChatUsersList from "./NewChatUsersList";

type MessagesDrawerProps = {
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    users: User[];
    messages: MessagesType;
    onlineUsers: string[];
    selectedUser: User | null;
    handleUserClick: (userId: number) => void;
};

type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

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

const MessagesDrawer: React.FC<MessagesDrawerProps> = ({
    drawerOpen,
    setDrawerOpen,
    users,
    messages,
    onlineUsers,
    selectedUser,
    handleUserClick,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [usersList, setUsersList] = useState<User[]>([]);
    const open = Boolean(anchorEl);

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    const fetchUsersList = async () => {
        const response = await getFollowingUsers(currentUser?.id);
        if (response.success) {
            setUsersList(response.data);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

    const getLastMessageText = (lastMessage: Message | undefined) => {
        if (!lastMessage) return "No messages yet";

        if (lastMessage.message_text) {
            return lastMessage.message_text.trim();
        }

        if (lastMessage.file_url) {
            const fileType = lastMessage.file_name?.split(".").pop()?.toLowerCase();

            if (!fileType) {
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />
                        <Typography variant="body2" component="span">
                            [File]
                        </Typography>
                    </Box>
                );
            }

            const fileTypeMapping: Record<string, { icon: JSX.Element; label: string }> = {
                jpg: { icon: <Image sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Image" },
                jpeg: { icon: <Image sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Image" },
                png: { icon: <Image sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Image" },
                gif: { icon: <Image sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Image" },
                mp4: { icon: <VideoLibrary sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Video" },
                mov: { icon: <VideoLibrary sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Video" },
                avi: { icon: <VideoLibrary sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Video" },
                mp3: { icon: <MusicNote sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Audio" },
                wav: { icon: <MusicNote sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Audio" },
                pdf: { icon: <Description sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "PDF" },
                doc: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Document" },
                docx: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Document" },
                xls: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Spreadsheet" },
                xlsx: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Spreadsheet" },
                ppt: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Presentation" },
                pptx: { icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />, label: "Presentation" },
            };

            const fileData = fileTypeMapping[fileType] || {
                icon: <InsertDriveFile sx={{ fontSize: 16, verticalAlign: "middle" }} />,
                label: "[File]",
            };

            return (
                <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {fileData.icon}
                    <Typography variant="body2" component="span">
                        {fileData.label}
                    </Typography>
                </Box>
            );
        }

        return "No messages yet";
    };

    return (
        <div>
            {isMobile ? (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": { border: "none", boxShadow: "none" },
                    }}
                >
                    <Box sx={{ width: 300, backgroundColor: "#111111", color: "white", height: "100vh" }}>
                        <IconButton sx={{ position: "absolute", right: 5, top: 15 }} onClick={() => setDrawerOpen(false)}>
                            <ChevronLeftIcon sx={{ color: "white" }} />
                        </IconButton>
                        <Typography variant="h6" sx={{ p: "20px" }}>
                            Messages
                        </Typography>
                        <List>
                            {users.map((user) => {
                                const userMessages = messages[user.id] || [];
                                const lastMessage = userMessages[userMessages.length - 1];
                                const lastMessageText = getLastMessageText(lastMessage);
                                const isOnline = onlineUsers.includes(user.id.toString());
                                return (
                                    <ListItem
                                        sx={{
                                            backgroundColor: selectedUser?.id === user.id ? "#202327" : "transparent",
                                            padding: "12px",
                                            mb: 1,
                                            textAlign: "left",
                                            width: "100%",
                                            border: "none",
                                            position: "relative",
                                        }}
                                        component="button"
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                    >
                                        <ListItemAvatar sx={{ position: "relative" }}>
                                            <Avatar src={user.profile_picture || "https://via.placeholder.com/40"} />
                                            <Box
                                                sx={{
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "50%",
                                                    backgroundColor: isOnline ? "#54ff54" : "gray",
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 10,
                                                    border: "2px solid #000",
                                                }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.username}
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                                >
                                                    {lastMessageText}
                                                </Typography>
                                            }
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: "0",
                                                bottom: "0",
                                                width: "3px",
                                                backgroundColor: "#1976D2",
                                                visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>
            ) : (
                <Box
                    sx={{
                        width: { sm: "250px", md: "300px", lg: "350px" },
                        backgroundColor: "#000000",
                        color: "white",
                        borderRight: "1px solid #202327",
                        height: "100vh",
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
                        <Typography variant="h6">Messages</Typography>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <PersonAddIcon sx={{ color: "white" }} />
                        </IconButton>
                    </Box>

                    <NewChatUsersList
                        anchorEl={anchorEl}
                        open={open}
                        setAnchorEl={setAnchorEl}
                        usersList={usersList}
                        handleUserClick={handleUserClick}
                    />
                    <List>
                        {users?.map((user) => {
                            const userMessages = messages[user.id] || [];
                            const lastMessage = userMessages[userMessages.length - 1];
                            const lastMessageText = getLastMessageText(lastMessage);
                            const unreadCount = userMessages.filter((msg) => msg.sender_id === user.id && !msg.read).length;
                            const isOnline = onlineUsers.includes(user.id.toString());

                            return (
                                <ListItem
                                    component="button"
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    sx={{
                                        backgroundColor: selectedUser?.id === user.id ? "#202327" : unreadCount ? "hsl(213, 77%,10%)" : "transparent",
                                        padding: "12px",
                                        mb: 1,
                                        textAlign: "left",
                                        width: "100%",
                                        border: "none",
                                        position: "relative",
                                    }}
                                >
                                    <ListItemAvatar sx={{ position: "relative" }}>
                                        <Avatar
                                            sx={{ width: "50px", height: "50px", mr: "12px" }}
                                            src={user.profile_picture || "https://via.placeholder.com/40"}
                                        />
                                        <Box
                                            sx={{
                                                width: "12px",
                                                height: "12px",
                                                borderRadius: "50%",
                                                backgroundColor: isOnline ? "#54ff54" : "gray",
                                                position: "absolute",
                                                bottom: 0,
                                                right: 10,
                                                border: "1px solid #000",
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<Typography sx={{ fontSize: "1rem" }}>{user.username}</Typography>}
                                        secondary={
                                            <Typography
                                                sx={{
                                                    fontSize: "0.8rem",
                                                    color: "#aaa",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {lastMessageText}
                                            </Typography>
                                        }
                                    />

                                    {/* Unread Messages Badge */}
                                    {unreadCount > 0 && (
                                        <Badge
                                            badgeContent={unreadCount}
                                            color="primary"
                                            sx={{
                                                position: "absolute",
                                                right: "25px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                            }}
                                        />
                                    )}

                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: "0",
                                            bottom: "0",
                                            width: "3px",
                                            backgroundColor: "#1976D2",
                                            visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            )}
        </div>
    );
};

export default MessagesDrawer;
