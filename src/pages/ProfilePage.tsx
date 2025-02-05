import React, { useState, useEffect } from "react";
import { Container, Typography, Avatar, Grid, Paper, Dialog, Button, IconButton, Menu, MenuItem } from "@mui/material";
import ProfilePagePost from "../component/post/ProfilePagePost";
import ModalPost from "../component/post/ModalPost";
import { getProfile, getUserPosts, followUser } from "../services/api";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useParams, useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

interface Profile {
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
    is_request_active: boolean;
    follow_status: string;
    is_following: boolean;
    is_private: boolean;
}

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "");

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    async function fetchProfile() {
        try {
            if (userId && currentUser?.id) {
                const res = await getProfile(userId, currentUser?.id);
                setProfileData(res.data);
                setIsFollowing(res.data.is_following);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchUserPosts() {
        try {
            if (userId) {
                const res = await getUserPosts(currentUser?.id, userId);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (!profileData) return;

        if (currentUser?.id == userId || !profileData.is_private || profileData.is_following) {
            fetchUserPosts();
        }
    }, [profileData, userId, currentUser?.id]);

    const handleOpenModal = (post: any) => {
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    const handleFollow = async () => {
        if (currentUser?.id && userId) {
            try {
                const res = await followUser(currentUser.id.toString(), userId);
                if (res?.success) {
                    fetchProfile();
                }
            } catch (error) {
                console.error("Failed to follow the user:", error);
            }
        }
    };

    const handleSendMessage = () => {
        navigate(`/messages/${userId}`, { state: profileData });
    };
    const handleMoreOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        navigate("/settings?setting=profiledetails");
        handleCloseMenu();
    };

    return (
        <Container sx={{ padding: "10px", marginBottom: "50px" }}>
            <Paper
                sx={{
                    padding: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: "20px",
                    boxShadow: 3,
                    background: "linear-gradient(0deg,rgb(71, 71, 71),rgb(0, 0, 0))",
                }}
            >
                <Grid container spacing={3} alignItems="start" sx={{ position: "relative" }}>
                    <IconButton aria-label="more options" onClick={handleMoreOptionsClick} sx={{ position: "absolute", right: 0, top: 15 }}>
                        <MoreHorizIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                        sx={{
                            "& .MuiPaper-root": {
                                width: "150px",
                                padding: "1px 8px",
                                borderRadius: "20px",
                            },
                        }}
                    >
                        <MenuItem onClick={handleEditProfile} sx={{ width: "100%", textAlign: "center", height: "40px", borderRadius: "15px" }}>
                            Edit Profile
                        </MenuItem>
                    </Menu>
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

                        {userId != currentUser?.id && (
                            <Button
                                onClick={
                                    (isFollowing && profileData?.follow_status === "accepted") || profileData?.is_request_active
                                        ? () => {}
                                        : handleFollow
                                }
                                disabled={(isFollowing && profileData?.follow_status === "accepted") || profileData?.is_request_active}
                                variant="outlined"
                                sx={{ mt: 2, borderRadius: "20px" }}
                            >
                                {profileData?.is_request_active
                                    ? "Request Pending"
                                    : isFollowing && profileData?.follow_status === "accepted"
                                    ? "Following"
                                    : "Follow"}
                            </Button>
                        )}

                        {userId != currentUser?.id && (
                            <Button onClick={handleSendMessage} variant="contained" sx={{ mt: 2, ml: 2, borderRadius: "20px" }}>
                                Send Message
                            </Button>
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
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#888888" }}>
                                    POSTS
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ fontSize: "20px", mb: 1 }}>
                                    {profileData?.followers_count}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#888888" }}>
                                    FOLLOWERS
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ fontSize: "20px", mb: 1 }}>
                                    {profileData?.following_count}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#888888" }}>
                                    FOLLOWING
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            {profileData?.is_private && !profileData?.is_following && currentUser?.id != userId ? (
                <Grid item xs={12} sx={{ textAlign: "center", mt: 5 }}>
                    <LockIcon sx={{ fontSize: 60, color: "#888888" }} /> {/* Lock Icon */}
                    <Typography variant="body1" sx={{ fontSize: "18px", color: "#888888", mt: 1 }}>
                        This account is private. Follow to see their posts.
                    </Typography>
                </Grid>
            ) : (
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
            )}

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
