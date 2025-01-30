import { Container, Grid } from "@mui/material";
import Post from "../features/post/Post";
import { useEffect, useState } from "react";
import { getPosts } from "../services/api";

const HomePage = () => {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await getPosts();
                setPosts(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <Container maxWidth="sm">
            {/* Display posts dynamically */}
            <Grid container spacing={3}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={12} md={12} key={post.id}>
                            <Post
                                username={post.username}
                                content={post.content}
                                likes={post.likes_count}
                                comments={post.comments_count}
                                imageUrl={post.image_url}
                                avatarUrl={post.profile_picture}
                                timeAgo={post.timeAgo}
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
