import { Container, Grid, useMediaQuery, useTheme, CircularProgress, Box, Typography, Avatar } from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";
import Post from "../component/post/Post";
import StoryDialog from "../component/stories/StoryDialog";
import UploadStoryDialog from "../component/stories/UploadStoryDialog";
import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import { getStories } from "../services/api"; // Import getStories function

const HomePage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [openStoryDialog, setOpenStoryDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

    const fetchPosts = async () => {
        try {
            if (currentUser?.id) {
                const res = await getPosts(currentUser.id);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchStories = async () => {
        try {
            const res = await getStories(currentUser?.id);
            const groupedStories = res.reduce((acc: any, story: any) => {
                if (!acc[story.user_id]) {
                    acc[story.user_id] = {
                        user_id: story.user_id,
                        username: story.username,
                        profile_picture: story.profile_picture,
                        stories: [],
                    };
                }
                acc[story.user_id].stories.push(story);
                return acc;
            }, {});
            setStories(Object.values(groupedStories));
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchStories();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ padding: isMobile ? 0 : "10px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Box display="flex" gap="16px" sx={{ padding: isMobile ? "10px 10px 0px 10px" : "10px 0 10px 0" }}>
                {/* Current User Story Upload */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 65,
                        height: 65,
                        padding: "3px",
                        border: currentUser?.stories?.length ? "3px solid #ff8800" : "none",
                        borderRadius: "50%",
                    }}
                >
                    <Avatar
                        src={currentUser?.profile_picture_url || "https://via.placeholder.com/50"}
                        onClick={() => setOpenUploadDialog(true)}
                        sx={{ width: "100%", height: "100%", cursor: "pointer" }}
                    />
                </Box>

                <Box sx={{ display: "flex", gap: "16px" }}>
                    {stories.map((userStory, index) => (
                        <Box key={userStory.user_id} display="flex" flexDirection="column" alignItems="center" sx={{ gap: 0.75 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 65,
                                    height: 65,
                                    padding: "3px",
                                    border: "3px solid #ff8800",
                                    borderRadius: "50%",
                                }}
                            >
                                <Avatar
                                    src={userStory.profile_picture || "https://via.placeholder.com/50"}
                                    onClick={() => {
                                        setSelectedStoryIndex(index);
                                        setOpenStoryDialog(true);
                                    }}
                                    sx={{ width: "100%", height: "100%", cursor: "pointer" }}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: "0.75rem",
                                    maxWidth: 70,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textAlign: "center",
                                }}
                            >
                                {userStory.username}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {loadingPosts ? (
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
                                paddingTop: "0 !important",
                                width: "100%",
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

            <StoryDialog open={openStoryDialog} onClose={() => setOpenStoryDialog(false)} stories={stories} selectedStoryIndex={selectedStoryIndex} />
            <UploadStoryDialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} />
        </Container>
    );
};

export default HomePage;
