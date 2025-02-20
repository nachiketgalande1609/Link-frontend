import { Container, Grid, useMediaQuery, useTheme, CircularProgress, Box, Typography, Avatar } from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";
import Post from "../component/post/Post";
import StoryDialog from "../component/stories/StoryDialog";
import UploadStoryDialog from "../component/stories/UploadStoryDialog";
import { useEffect, useState } from "react";
import { getPosts } from "../services/api";

const HomePage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [openStoryDialog, setOpenStoryDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);

    const stories = [
        { id: 1, image: "https://via.placeholder.com/500" },
        { id: 2, image: "https://via.placeholder.com/600" },
    ];

    const fetchPosts = async () => {
        try {
            if (currentUser) {
                const res = await getPosts(currentUser?.id);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ padding: isMobile ? 0 : "10px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Box display="flex" gap={1} p={2}>
                {/* Current User Story Upload */}
                <Avatar
                    src={currentUser?.profile_picture_url || "https://via.placeholder.com/50"}
                    onClick={() => setOpenUploadDialog(true)}
                    sx={{ width: 70, height: 70, cursor: "pointer", border: "2px solid blue" }}
                />
                {/* Other Stories */}
                {stories.map((story) => (
                    <Avatar
                        key={story.id}
                        src={story.image}
                        onClick={() => setOpenStoryDialog(true)}
                        sx={{ width: 70, height: 70, cursor: "pointer", border: "2px solid red" }}
                    />
                ))}
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" width="100%" flexGrow={1}>
                    <CircularProgress />
                </Box>
            ) : posts.length > 0 ? (
                <Grid container spacing={3} sx={{ marginTop: "10px" }}>
                    {posts.map((post, index) => (
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            key={post.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                padding: "0 !important", // Enforce no padding
                                marginBottom: index !== posts.length - 1 ? "20px" : "none",
                            }}
                        >
                            <Post post={post} fetchPosts={fetchPosts} borderRadius="20px" />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
                    <SentimentDissatisfied sx={{ fontSize: 60, color: "gray" }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                        No posts available
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Be the first to share something!
                    </Typography>
                </Box>
            )}
            <StoryDialog open={openStoryDialog} onClose={() => setOpenStoryDialog(false)} stories={stories} />{" "}
            <UploadStoryDialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} />
        </Container>
    );
};

export default HomePage;
