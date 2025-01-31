import { useState, useEffect } from "react";
import { TextField, Container, List, ListItem, ListItemText, CircularProgress, ListItemButton, ListItemAvatar, Avatar } from "@mui/material";
import { useDebounce } from "../utils/utils";
import { getSearchResults } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 300);
    const navigate = useNavigate(); // useNavigate hook to programmatically navigate

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery) {
                setResults([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await getSearchResults(debouncedQuery);
                setResults(response.data.users);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleItemClick = (userId: number) => {
        navigate(`/profile/${userId}`); // Navigate to the profile of the clicked user
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <TextField
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                    },
                }}
                fullWidth
                label="Search Users"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            <List>
                {results.map((user) => (
                    <ListItem key={user.id} divider sx={{ padding: 0 }}>
                        <ListItemButton onClick={() => handleItemClick(user.id)} sx={{ padding: "15px 10px" }}>
                            <ListItemAvatar>
                                <Avatar src={user.profile_picture} alt={user.username} sx={{ width: "50px", height: "50px", mr: 2 }} />
                            </ListItemAvatar>
                            <ListItemText primary={user.username} secondary={user.email} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}
