import { Container, Grid, useMediaQuery, useTheme, CircularProgress, Box, Typography } from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";
import Post from "../component/post/Post";
import { useEffect, useState } from "react";
import { getPosts } from "../services/api";

const HomePage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const user = JSON.parse(localStorage.getItem("user") || "");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchPosts = async () => {
        try {
            if (user) {
                const res = await getPosts(user?.id);
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
                                paddingTop: isMobile ? "0 !important" : "20px",
                                marginBottom: isMobile && index !== posts.length - 1 ? "2px" : "none", // Apply border except for last item
                            }}
                        >
                            <Post
                                username={post.username}
                                content={post.content}
                                likes={post.like_count}
                                comments={post.comment_count}
                                fileUrl={post.file_url}
                                avatarUrl={post.profile_picture}
                                timeAgo={post.timeAgo}
                                postId={post.id}
                                userId={post.user_id}
                                fetchPosts={fetchPosts}
                                hasUserLikedPost={post.liked_by_current_user}
                                initialComments={post.comments}
                                borderRadius="20px"
                            />
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
        </Container>
    );
};

export default HomePage;
