import { useState, useEffect } from "react";
import { Container, Typography, Avatar, Button, Grid, Paper, Dialog } from "@mui/material";
import ProfilePagePost from "../features/post/ProfilePagePost";
import ModalPost from "../features/post/ModalPost";
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
    const [selectedPost, setSelectedPost] = useState<any | null>(null); // Modal state

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

    // Handle opening the modal when clicking a post
    const handleOpenModal = (post: any) => {
        setSelectedPost(post);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    return (
        <Container>
            {/* Profile Section */}
            <Paper sx={{ padding: 3, mb: 3, borderRadius: "20px", boxShadow: 3 }}>
                <Grid container spacing={4}>
                    <Grid item>
                        <Avatar src={profileData?.profile_picture} sx={{ width: 120, height: 120, border: "3px solid #fff", boxShadow: 3 }} />
                    </Grid>
                    <Grid item xs={8}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {profileData?.username}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {profileData?.email}
                        </Typography>
                        {profileData?.bio && (
                            <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
                                {profileData?.bio}
                            </Typography>
                        )}
                        <Button variant="contained" color="primary" sx={{ mt: 2, borderRadius: "30px", textTransform: "none", fontWeight: "bold" }}>
                            Edit Profile
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Posts Section */}
            <Grid container spacing={3}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={post.id} onClick={() => handleOpenModal(post)} style={{ cursor: "pointer" }}>
                            <ProfilePagePost imageUrl={post.image_url} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <div>No posts available.</div>
                    </Grid>
                )}
            </Grid>

            {/* Modal to show post details */}
            <Dialog
                open={!!selectedPost}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="lg"
                sx={{
                    "& .MuiDialog-paper": {
                        border: "1px solid #444",
                    },
                }}
            >
                {selectedPost && (
                    <ModalPost
                        username={selectedPost.username}
                        content={selectedPost.content}
                        likes={selectedPost.like_count}
                        comments={selectedPost.comment_count}
                        imageUrl={selectedPost.image_url}
                        avatarUrl={selectedPost.profile_picture}
                        timeAgo={selectedPost.timeAgo}
                        postId={selectedPost.id}
                        userId={selectedPost.user_id}
                        fetchPosts={fetchUserPosts}
                        hasUserLikedPost={selectedPost.liked_by_current_user}
                        initialComments={selectedPost.comments}
                        borderRadius="0px"
                    />
                )}
            </Dialog>
        </Container>
    );
};

export default ProfilePage;
