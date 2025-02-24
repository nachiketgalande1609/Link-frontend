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
    const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [openStoryDialog, setOpenStoryDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

    const [selfStories, setSelfStories] = useState<any[]>([]);
    const [followingStories, setFollowingStories] = useState<any[]>([]);

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

            // Process self stories
            const selfStoriesData = res.data.selfStory || [];
            const groupedSelf = selfStoriesData.reduce((acc: any, story: any) => {
                const userId = story.user_id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user_id: userId,
                        username: story.username,
                        profile_picture: story.profile_picture,
                        stories: [],
                    };
                }
                acc[userId].stories.push(story);
                return acc;
            }, {});

            // Process following stories
            const followingStoriesData = res.data.stories || [];
            const groupedFollowing = followingStoriesData.reduce((acc: any, story: any) => {
                const userId = story.user_id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user_id: userId,
                        username: story.username,
                        profile_picture: story.profile_picture,
                        stories: [],
                    };
                }
                acc[userId].stories.push(story);
                return acc;
            }, {});

            setSelfStories(Object.values(groupedSelf));
            setFollowingStories(Object.values(groupedFollowing));
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchStories();
    }, []);

    return (
        <Container
            maxWidth="sm"
            sx={{
                padding: isMobile ? 0 : "10px",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                borderLeft: "1px solid #202327",
                borderRight: "1px solid #202327",
            }}
        >
            {/* Stories Section */}
            <Box display="flex" gap="16px" sx={{ padding: isMobile ? "15px 10px 10px 10px" : "10px 0 15px 0" }}>
                {/* Current User Story */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 65,
                        height: 65,
                        padding: "3px",
                        border: selfStories.length ? "3px solid #ff8800" : "none",
                        borderRadius: "50%",
                        position: "relative",
                    }}
                >
                    <Avatar
                        src={currentUser?.profile_picture_url || "https://via.placeholder.com/50"}
                        onClick={() => {
                            selfStories.length > 0 ? (setSelectedStoryIndex(0), setOpenStoryDialog(true)) : setOpenUploadDialog(true);
                        }}
                        sx={{ width: "100%", height: "100%", cursor: "pointer" }}
                    />
                    <Box
                        onClick={() => setOpenUploadDialog(true)}
                        sx={{
                            position: "absolute",
                            bottom: -5,
                            right: -5,
                            backgroundColor: "#ffffff",
                            borderRadius: "50%",
                            border: "2px solid #000000",
                            width: 22,
                            height: 22,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        <Typography sx={{ color: "#000000", fontSize: "22px" }}>+</Typography>
                    </Box>
                </Box>

                {/* Other User Stories */}
                <Box sx={{ display: "flex", gap: "16px" }}>
                    {followingStories.map((userStory, index) => (
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
                                        // Calculate correct index accounting for self stories
                                        const actualIndex = selfStories.length + index;
                                        setSelectedStoryIndex(actualIndex);
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

            {/* Posts Section */}
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

            {/* Other Children Components */}
            <StoryDialog
                open={openStoryDialog}
                onClose={() => setOpenStoryDialog(false)}
                stories={[...selfStories, ...followingStories]} // Combine for navigation
                selectedStoryIndex={selectedStoryIndex}
            />
            <UploadStoryDialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} />
        </Container>
    );
};

export default HomePage;
