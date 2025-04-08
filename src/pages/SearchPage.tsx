import { useState, useEffect, useRef } from "react";
import {
    TextField,
    Container,
    List,
    ListItem,
    ListItemText,
    IconButton,
    ListItemButton,
    Avatar,
    ListItemAvatar,
    LinearProgress,
    Box,
    Typography,
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
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Load search history
    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            try {
                const response = await getSearchHistory();
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    // Focus on search input when component mounts
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Handle user click
    const handleUserClick = (targetUser: any) => {
        // Navigate immediately
        navigate(`/profile/${targetUser.id}`);

        // Fire off background tasks without awaiting
        addToSearchHistory(targetUser.id)
            .then(() => getSearchHistory())
            .then((historyResponse) => {
                setHistory(historyResponse.data.data);
            })
            .catch((error) => {
                console.error("Error saving history:", error);
            });
    };

    // Delete history item
    const handleDeleteHistory = async (historyId: number) => {
        const deletedItem = history.find((item) => item.history_id === historyId);
        setHistory((prev) => prev.filter((item) => item.history_id !== historyId));

        try {
            await deleteSearchHistoryItem(historyId);
        } catch (error) {
            console.error("Delete failed:", error);
            // Re-add item if API call fails
            if (deletedItem) {
                setHistory((prev) => [deletedItem, ...prev]);
            }
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
        <Container
            maxWidth="sm"
            disableGutters
            sx={{
                minHeight: "100vh",
                borderLeft: "1px solid #202327",
                borderRight: "1px solid #202327",
                p: 0,
            }}
        >
            <Box sx={{ borderBottom: "1px solid #202327", padding: "20px 20px 10px 20px" }}>
                <TextField
                    sx={{
                        "& .MuiInput-underline:before": { borderBottom: "none !important" },
                        "& .MuiInput-underline:after": { borderBottom: "none !important" },
                        "& .MuiInput-underline:hover:before": { borderBottom: "none !important" },
                    }}
                    fullWidth
                    placeholder="Search Users"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inputRef={searchInputRef}
                    variant="standard"
                />
            </Box>

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
                <Box sx={{ padding: "8px 10px" }}>
                    {/* Search Results */}
                    {results.length > 0 ? (
                        <List sx={{ padding: 0 }}>
                            {results.map((user) => (
                                <ListItem key={user.id} sx={{ padding: "5px 0" }} onClick={() => handleUserClick(user)}>
                                    <ListItemButton
                                        sx={{
                                            padding: "4px 16px",
                                            borderRadius: "20px",
                                            "&:hover": { backgroundColor: "#202327" },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={
                                                    user.profile_picture ||
                                                    "https://static-00.iconduck.com/assets.00/profile-major-icon-512x512-xosjbbdq.png"
                                                }
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={user.username} secondary={user.email} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    ) : debouncedQuery ? (
                        // No users found
                        <Box sx={{ padding: "10px", textAlign: "center", color: "gray" }}>
                            <Typography>No users found</Typography>
                        </Box>
                    ) : history?.length > 0 ? (
                        // Search history
                        <List sx={{ padding: 0 }}>
                            {history.map((item) => (
                                <ListItem key={item.history_id} sx={{ padding: "5px 0" }} onClick={() => navigate(`/profile/${item.id}`)}>
                                    <ListItemButton
                                        sx={{
                                            padding: "4px 16px",
                                            borderRadius: "20px",
                                            "&:hover": { backgroundColor: "#202327" },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={
                                                    item.profile_picture ||
                                                    "https://static-00.iconduck.com/assets.00/profile-major-icon-512x512-xosjbbdq.png"
                                                }
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={item.username} secondary={item.email} />
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteHistory(item.history_id);
                                            }}
                                            sx={{
                                                color: "hsl(226, 11%, 40%)",
                                                "&:hover": { backgroundColor: "transparent", color: "#ffffff" },
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        // No search input and no history
                        <Box sx={{ padding: "10px", textAlign: "center", color: "gray" }}>
                            <Typography> Search for users</Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Container>
    );
}
