// SearchPage.tsx
import { useState, useEffect } from "react";
import {
    TextField,
    Container,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    IconButton,
    ListItemButton,
    Avatar,
    ListItemAvatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDebounce } from "../utils/utils";
import { getSearchResults, getSearchHistory, addToSearchHistory, deleteSearchHistoryItem } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const navigate = useNavigate();

    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

    // Load search history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getSearchHistory(currentUser?.id);
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to load history:", error);
            }
        };
        loadHistory();
    }, []);

    // Handle user click
    const handleUserClick = async (targetUser: any) => {
        try {
            // Add to search history
            await addToSearchHistory(currentUser?.id, targetUser.id);
            // Refresh history list
            const historyResponse = await getSearchHistory(currentUser?.id);
            setHistory(historyResponse.data.data);
            // Navigate to profile
            navigate(`/profile/${targetUser.id}`);
        } catch (error) {
            console.error("Error saving history:", error);
        }
    };

    // Delete history item
    const handleDeleteHistory = async (historyId: number) => {
        try {
            await deleteSearchHistoryItem(currentUser?.id, historyId);
            setHistory((prev) => prev.filter((item) => item.history_id !== historyId));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Search effect remains similar
    useEffect(() => {
        const search = async () => {
            if (!debouncedQuery) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await getSearchResults(debouncedQuery);
                setResults(response.data.users);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        search();
    }, [debouncedQuery]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <TextField
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                    },
                }}
                fullWidth
                label="Search Users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
            {/* Search Results */}
            {results.length > 0 && (
                <List sx={{ padding: 0 }}>
                    {results.map((user) => (
                        <ListItem key={user.id} divider sx={{ padding: "10px 0" }}>
                            <ListItemButton onClick={() => handleUserClick(user)} sx={{ padding: "4px 16px" }}>
                                <ListItemAvatar>
                                    <Avatar src={user.profile_picture} />
                                </ListItemAvatar>
                                <ListItemText primary={user.username} secondary={user.email} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
            {/* Search History */}
            {!debouncedQuery && history?.length > 0 && (
                <List sx={{ padding: 0 }}>
                    {history.map((item) => (
                        <ListItem key={item.history_id} divider sx={{ padding: "10px 0" }}>
                            <ListItemButton sx={{ padding: "4px 16px" }}>
                                <ListItemAvatar>
                                    <Avatar src={item.profile_picture} />
                                </ListItemAvatar>
                                <ListItemText primary={item.username} secondary={item.email} onClick={() => navigate(`/profile/${item.user_id}`)} />
                                <IconButton
                                    edge="end"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHistory(item.history_id);
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Container>
    );
}
