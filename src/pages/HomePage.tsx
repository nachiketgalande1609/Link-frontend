import { Container, Grid, useMediaQuery, useTheme } from "@mui/material";
import Post from "../component/post/Post";
import { useEffect, useState } from "react";
import { getPosts } from "../services/api";

const HomePage = () => {
    const [posts, setPosts] = useState<any[]>([]);
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
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ padding: isMobile ? 0 : "10px" }}>
            {/* Display posts dynamically */}
            <Grid container spacing={3}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={12} md={12} key={post.id}>
                            <Post
                                username={post.username}
                                content={post.content}
                                likes={post.like_count}
                                comments={post.comment_count}
                                imageUrl={post.image_url}
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
                    ))
                ) : (
                    <Grid item xs={12}>
                        <div>No posts available.</div>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default HomePage;
