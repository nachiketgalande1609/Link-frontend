import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, LinearProgress, Badge } from "@mui/material";
import { getFollowingUsers } from "../../../services/api";
import { timeAgo } from "../../../utils/utils";

type UserListProps = {
    users: User[];
    onlineUsers: string[];
    handleUserClick: (userId: number) => void;
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

const UserList: React.FC<UserListProps> = ({ users, onlineUsers, handleUserClick }) => {
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

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
        <Box sx={{ width: "100%", backgroundColor: "#111111", color: "white", height: "100vh" }}>
            <Typography variant="h6" sx={{ p: " 19px 20px", borderBottom: "1px solid #202327" }}>
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
                    {[...users]
                        .sort((a, b) => new Date(b.latest_message_timestamp).getTime() - new Date(a.latest_message_timestamp).getTime())
                        .map((user) => {
                            const lastMessageText = user.latest_message;
                            const isOnline = onlineUsers.includes(user.id.toString());
                            const lastMessageTimestamp = timeAgo(user.latest_message_timestamp);
                            const unreadCount = 0;

                            return (
                                <ListItem
                                    sx={{
                                        backgroundColor: unreadCount ? "hsl(213, 77%,10%)" : "transparent",
                                        padding: "12px",
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
                                        <Avatar
                                            src={
                                                user.profile_picture ||
                                                "https://static-00.iconduck.com/assets.00/profile-major-icon-512x512-xosjbbdq.png"
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
                                </ListItem>
                            );
                        })}
                </List>
            )}
        </Box>
    );
};

export default UserList;
