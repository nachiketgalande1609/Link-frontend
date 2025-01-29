import { Container, Typography, Avatar, Button, Grid, Paper } from "@mui/material";
import Post from "../features/post/Post";

const ProfilePage = () => {
    return (
        <Container>
            <Paper sx={{ padding: 3, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item>
                        <Avatar sx={{ width: 100, height: 100 }}>A</Avatar>
                    </Grid>
                    <Grid item>
                        <Typography variant="h4">John Doe</Typography>
                        <Typography variant="subtitle1">@johndoe</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            This is a brief bio about John Doe. He loves coding and creating apps!
                        </Typography>
                        <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                            Edit Profile
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Posts by John Doe
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
