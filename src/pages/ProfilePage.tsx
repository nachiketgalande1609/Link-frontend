import { useState, useEffect } from "react";
import { Container, Typography, Avatar, Grid, Paper, Dialog } from "@mui/material";
import ProfilePagePost from "../component/post/ProfilePagePost";
import ModalPost from "../component/post/ModalPost";
import { getProfile, getUserPosts } from "../services/api";
import { useUser } from "../context/userContext";
import { useParams } from "react-router-dom";

interface Profile {
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
}

const ProfilePage = () => {
    const { userId } = useParams(); // Extract userId from URL

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    async function fetchProfile() {
        try {
            if (userId) {
                const res = await getProfile(userId);
                setProfileData(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchUserPosts() {
        try {
            if (userId) {
                const res = await getUserPosts(userId);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
    }, [userId]);

    const handleOpenModal = (post: any) => {
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    return (
        <Container>
            <Paper
                sx={{
                    padding: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: "20px",
                    boxShadow: 3,
                    background: "linear-gradient(0deg,rgb(71, 71, 71),rgb(0, 0, 0))",
                }}
            >
                <Grid container spacing={3} alignItems="start">
                    <Grid item xs={12} sm={12} md={3} lg={2} sx={{ display: "flex", justifyContent: "center" }}>
                        <Avatar
                            src={profileData?.profile_picture}
                            sx={{
                                width: { xs: 100, sm: 110, md: 120, lg: 140 },
                                height: { xs: 100, sm: 110, md: 120, lg: 140 },
                                border: "3px solid #fff",
                                boxShadow: 3,
                                transition: "transform 0.3s ease-in-out",
                                "&:hover": { transform: "scale(1.1)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={9}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: "bold",
                                textAlign: { xs: "center", sm: "center", md: "left" },
                            }}
                        >
                            {profileData?.username}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ textAlign: { xs: "center", sm: "center", md: "left" } }}>
                            {profileData?.email}
                        </Typography>

                        {profileData?.bio && (
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    fontStyle: "italic",
                                    textAlign: { xs: "center", sm: "center", md: "left" },
                                }}
                            >
                                {profileData?.bio}
                            </Typography>
                        )}

                        <Grid
                            container
                            spacing={2}
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                textAlign: "center",
                            }}
                        >
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ fontSize: "20px", mb: 1 }}>
                                    {profileData?.posts_count}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                    Posts
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ fontSize: "20px", mb: 1 }}>
                                    {profileData?.followers_count}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                    Followers
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ fontSize: "20px", mb: 1 }}>
                                    {profileData?.following_count}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                    Following
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post.id} onClick={() => handleOpenModal(post)} style={{ cursor: "pointer" }}>
                            <ProfilePagePost imageUrl={post.image_url} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
                            No posts available.
                        </Typography>
                    </Grid>
                )}
            </Grid>

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
