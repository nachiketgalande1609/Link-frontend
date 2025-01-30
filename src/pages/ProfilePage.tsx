import { useState, useEffect } from "react";
import { Container, Typography, Avatar, Button, Grid, Paper } from "@mui/material";
import Post from "../features/post/Post";
import { getProfile } from "../services/api";
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

    useEffect(() => {
        async function fetchProfile() {
            try {
                if (user) {
                    const res = await getProfile(user?.id);
                    setProfileData(res.data); // Assuming res.data contains the profile data
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchProfile();
    }, [user]);

    return (
        <Container>
            <Paper sx={{ padding: 3, mb: 3 }}>
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

            <Typography variant="h5" gutterBottom>
                Posts by {profileData?.username}
            </Typography>

            {/* Display user's posts */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Post
                        username={"Nachiket"}
                        content={"Hello"}
                        likes={10}
                        comments={20}
                        avatarUrl={"https://nachiketgalande1609.github.io/MyPortfolio/assets/img/profile-img.jpg"}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Post
                        username={"Nachiket"}
                        content={"Hello"}
                        likes={10}
                        comments={20}
                        avatarUrl={"https://nachiketgalande1609.github.io/MyPortfolio/assets/img/profile-img.jpg"}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Post
                        username={"Nachiket"}
                        content={"Hello"}
                        likes={10}
                        comments={20}
                        avatarUrl={"https://nachiketgalande1609.github.io/MyPortfolio/assets/img/profile-img.jpg"}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProfilePage;
