import { useState, useEffect } from "react";
import { Container, Typography, Avatar, Button, Grid, Paper } from "@mui/material";
import Post from "../features/post/Post";
import { getProfile, getUserPosts } from "../services/api";
import { useUser } from "../context/userContext";

// Define the type for the profile data
interface Profile {
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
}

const ProfilePage = () => {
    const { user } = useUser();

    const [profileData, setProfileData] = useState<Profile | null>(null);

    const [posts, setPosts] = useState<any[]>([]);

    async function fetchProfile() {
        try {
            if (user) {
                const res = await getProfile(user?.id);
                setProfileData(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchUserPosts() {
        try {
            if (user) {
                const res = await getUserPosts(user?.id);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
    }, [user]);

    return (
        <Container>
            <Paper sx={{ padding: 3, mb: 3, borderRadius: "20px" }}>
                <Grid container spacing={2}>
                    <Grid item>
                        <Avatar src={profileData?.profile_picture} sx={{ width: 100, height: 100 }} />
                    </Grid>
                    <Grid item>
                        <Typography variant="h4">{profileData?.username}</Typography>
                        <Typography variant="subtitle1">{profileData?.email}</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            {profileData?.bio}
                        </Typography>
                        <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                            Edit Profile
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            {/* Display user's posts */}
            <Grid container spacing={3}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={4} md={4} key={post.id}>
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
                                fetchPosts={fetchUserPosts}
                                hasUserLikedPost={post.liked_by_current_user}
                                initialComments={post.comments}
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

export default ProfilePage;
