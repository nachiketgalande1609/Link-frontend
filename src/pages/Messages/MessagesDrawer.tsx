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
    LinearProgress,
    Badge,
} from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { getFollowingUsers } from "../../services/api";
import NewChatUsersList from "./NewChatUsersList";
import { timeAgo } from "../../utils/utils";

type MessagesDrawerProps = {
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    users: User[];
    onlineUsers: string[];
    selectedUser: User | null;
    handleUserClick: (userId: number) => void;
    anchorEl: HTMLElement | null;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};

type User = {
    id: number;
    username: string;
    profile_picture: string;
    isOnline: boolean;
    latest_message: string;
    latest_message_timestamp: string;
    unread_count: number;
};

const MessagesDrawer: React.FC<MessagesDrawerProps> = ({
    drawerOpen,
    setDrawerOpen,
    users,
    onlineUsers,
    selectedUser,
    handleUserClick,
    anchorEl,
    setAnchorEl,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const open = Boolean(anchorEl);

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            const response = await getFollowingUsers();
            if (response.success) {
                setUsersList(response.data);
            }
        } catch (error) {
            console.error("Error fetching users list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

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
                        <Typography variant="h6" sx={{ p: "20px", borderBottom: "1px solid #202327" }}>
                            Messages
                        </Typography>
                        {loading ? (
                            <LinearProgress
                                sx={{
                                    width: "100%",
                                    height: "3px",
                                    background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                                    "& .MuiLinearProgress-bar": {
                                        background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                                    },
                                }}
                            />
                        ) : (
                            <List sx={{ padding: 0 }}>
                                {users.map((user) => {
                                    const lastMessageText = user.latest_message;
                                    const isOnline = onlineUsers.includes(user.id.toString());
                                    const lastMessageTimestamp = timeAgo(user.latest_message_timestamp);
                                    const unreadCount = 0; // Single message check

                                    return (
                                        <ListItem
                                            sx={{
                                                backgroundColor:
                                                    selectedUser?.id === user.id ? "#202327" : unreadCount ? "hsl(213, 77%,10%)" : "transparent",
                                                padding: "12px",
                                                textAlign: "left",
                                                width: "100%",
                                                border: "none",
                                                position: "relative",
                                            }}
                                            component="button"
                                            key={user.id}
                                            onClick={() => {
                                                handleUserClick(user.id);
                                            }}
                                        >
                                            <ListItemAvatar sx={{ position: "relative" }}>
                                                <Avatar
                                                    src={
                                                        user.profile_picture ||
                                                        "https://png.pngitem.com/pimgs/s/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                                                    }
                                                />
                                                {isOnline && (
                                                    <Box
                                                        sx={{
                                                            width: "10px",
                                                            height: "10px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "#54ff54",
                                                            position: "absolute",
                                                            bottom: 0,
                                                            right: 13,
                                                            border: "1px solid #000",
                                                        }}
                                                    />
                                                )}
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.username}
                                                secondary={
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: "#aaa",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                maxWidth: "calc(100% - 50px)",
                                                            }}
                                                        >
                                                            {lastMessageText}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "#aaa",
                                                                whiteSpace: "nowrap",
                                                                marginLeft: "8px",
                                                            }}
                                                        >
                                                            {lastMessageTimestamp}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            {unreadCount > 0 && (
                                                <Badge
                                                    badgeContent={unreadCount}
                                                    color="primary"
                                                    sx={{
                                                        position: "absolute",
                                                        right: "22px",
                                                        top: "calc(50% - 13px )",
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
                                                    width: "4px",
                                                    backgroundColor: "#1976D2",
                                                    visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                                }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: "19px 12px",
                            borderBottom: "1px solid #202327",
                        }}
                    >
                        <Typography variant="h6">Messages</Typography>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ padding: 0 }}>
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
                    {loading ? (
                        <LinearProgress
                            sx={{
                                width: "100%",
                                height: "3px",
                                background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                                "& .MuiLinearProgress-bar": {
                                    background: "linear-gradient(90deg, #7a60ff, #ff8800)",
                                },
                            }}
                        />
                    ) : (
                        <List sx={{ padding: 0 }}>
                            {users?.map((user) => {
                                const lastMessageText = user.latest_message;
                                const unreadCount = user.unread_count || 0; // Single message check
                                const isOnline = onlineUsers.includes(user.id.toString());
                                const lastMessageTimestamp = timeAgo(user.latest_message_timestamp);

                                return (
                                    <ListItem
                                        component="button"
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                        sx={{
                                            backgroundColor:
                                                selectedUser?.id === user.id ? "#202327" : unreadCount ? "hsl(213, 77%,10%)" : "transparent",
                                            padding: "12px",
                                            textAlign: "left",
                                            width: "100%",
                                            border: "none",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <ListItemAvatar sx={{ position: "relative" }}>
                                            <Avatar
                                                sx={{ width: "50px", height: "50px", mr: "12px" }}
                                                src={
                                                    user.profile_picture ||
                                                    "https://png.pngitem.com/pimgs/s/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                                                }
                                            />
                                            {isOnline && (
                                                <Box
                                                    sx={{
                                                        width: "12px",
                                                        height: "12px",
                                                        borderRadius: "50%",
                                                        backgroundColor: "#54ff54",
                                                        position: "absolute",
                                                        bottom: 0,
                                                        right: 10,
                                                        border: "1px solid #000",
                                                    }}
                                                />
                                            )}
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.username}
                                            secondary={
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#aaa",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "calc(100% - 50px)", // Adjust based on layout
                                                        }}
                                                    >
                                                        {lastMessageText}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#aaa",
                                                            whiteSpace: "nowrap",
                                                            marginLeft: "8px",
                                                        }}
                                                    >
                                                        {lastMessageTimestamp}
                                                    </Typography>
                                                </Box>
                                            }
                                        />

                                        {/* Unread Messages Badge */}
                                        {unreadCount > 0 && (
                                            <Badge
                                                badgeContent={unreadCount}
                                                color="primary"
                                                sx={{
                                                    position: "absolute",
                                                    right: "22px",
                                                    top: "calc(50% - 13px )",
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
                                                width: "4px",
                                                backgroundColor: "#1976D2",
                                                visibility: selectedUser?.id === user.id ? "visible" : "hidden",
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Box>
            )}
        </div>
    );
};

export default MessagesDrawer;
