import { useState, useEffect } from "react";
import { Container, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "react-router-dom";
import { getUserMessageDetails } from "../services/api";

const initialUsers = [
    { id: 1, username: "Alice", avatar: "https://via.placeholder.com/40" },
    { id: 2, username: "Bob", avatar: "https://via.placeholder.com/40" },
    { id: 3, username: "Charlie", avatar: "https://via.placeholder.com/40" },
];

type Message = { sender: string; text: string };

type MessagesType = {
    [key: number]: Message[];
};

const initialMessages: MessagesType = {
    1: [
        { sender: "Alice", text: "Hey there! How's it going?" },
        { sender: "me", text: "Hey Alice! I'm doing great, how about you?" },
    ],
    2: [
        { sender: "Bob", text: "Did you see the game last night?" },
        { sender: "me", text: "Yeah! That was an intense match." },
    ],
    3: [
        { sender: "Charlie", text: "Are we still on for the weekend trip?" },
        { sender: "me", text: "Absolutely! Can't wait." },
    ],
};

const Messages = () => {
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [messages, setMessages] = useState<MessagesType>(initialMessages);
    const [inputMessage, setInputMessage] = useState("");

    const { userId } = useParams();

    useEffect(() => {
        if (userId) {
            const userIdNum = parseInt(userId, 10);
            fetchUserDetails(userIdNum);
        }
    }, [userId]);

    const fetchUserDetails = async (userId: number) => {
        try {
            const res = await getUserMessageDetails(userId.toString());
            const newUser = res.data;

            // Check if the user already exists in the list and add them only if they are not there
            setUsers((prevUsers) => {
                if (!prevUsers.find((user) => user.id === newUser.id)) {
                    return [{ ...newUser, avatar: newUser.profile_picture || "https://via.placeholder.com/40" }, ...prevUsers];
                }
                return prevUsers; // Return the previous state if user already exists
            });

            setSelectedUser(newUser); // Select the new user
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        }
    };

    const handleUserClick = (userId: number) => {
        setSelectedUser(users.find((user) => user.id === userId));
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedUser) return;

        setMessages((prev) => ({
            ...prev,
            [selectedUser.id]: [...(prev[selectedUser.id] || []), { sender: "me", text: inputMessage }],
        }));

        setInputMessage("");
    };

    return (
        <Container sx={{ width: "100%", height: "calc(100vh)", padding: "0px !important", margin: 0 }}>
            <Grid container sx={{ width: "100%", height: "calc(100vh)", overflow: "hidden", margin: 0, padding: 0 }}>
                <Grid item xs={6} sm={4} md={4} sx={{ backgroundColor: "#000000", color: "white", padding: 2, borderRight: "1px solid #333333" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Messages
                    </Typography>
                    <List>
                        {users.map((user) => (
                            <ListItem
                                component="button"
                                key={user.id}
                                onClick={() => handleUserClick(user.id)}
                                sx={{
                                    border: "none",
                                    backgroundColor: "black",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    mb: 1,
                                    outline: selectedUser?.id === user.id ? "2px solid #ffffff" : "none",
                                    textAlign: "left",
                                    width: "100%",
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ width: "50px", height: "50px", mr: "12px" }} src={user.avatar} />
                                </ListItemAvatar>
                                <ListItemText primary={user.username} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid
                    item
                    xs={6}
                    sm={8}
                    md={8}
                    sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000000", color: "white" }}
                >
                    {/* Display the band showing selected user's name and avatar */}
                    {selectedUser && (
                        <Box
                            sx={{
                                backgroundColor: "#000000",
                                color: "white",
                                padding: "15px",
                                display: "flex",
                                alignItems: "center",
                                borderBottom: "1px solid #333333",
                            }}
                        >
                            <Avatar sx={{ width: "40px", height: "40px", mr: 2 }} src={selectedUser.profile_picture} />
                            <Typography variant="h6">{selectedUser.username}</Typography>
                        </Box>
                    )}

                    <Box sx={{ flexGrow: 1, padding: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        {selectedUser ? (
                            messages[selectedUser.id]?.map((msg, index) => (
                                <Box key={index} sx={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start", mb: 1 }}>
                                    <Typography
                                        sx={{
                                            backgroundColor: msg.sender === "me" ? "#1976d2" : "#444",
                                            padding: "8px 12px",
                                            borderRadius: "12px",
                                            maxWidth: "70%",
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ textAlign: "center", mt: 5 }}>
                                Select a user to start chatting
                            </Typography>
                        )}
                    </Box>

                    {selectedUser && (
                        <Box sx={{ display: "flex", padding: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                sx={{
                                    input: { color: "white" },
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                    },
                                }}
                            />

                            <IconButton onClick={handleSendMessage} color="primary">
                                <SendIcon />
                            </IconButton>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Messages;
