import { Container, Typography, Grid, Button } from "@mui/material";
import Post from "../features/post/Post";

const HomePage = () => {
    return (
        <Container>
            {/* Display posts (for now, it's just a placeholder) */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12} md={12}>
                    <Post
                        username={"Nachiket"}
                        content={"Hello"}
                        likes={10}
                        comments={20}
                        avatarUrl={"https://nachiketgalande1609.github.io/MyPortfolio/assets/img/profile-img.jpg"}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Post
                        username={"Nachiket"}
                        content={"Hello"}
                        likes={10}
                        comments={20}
                        avatarUrl={"https://nachiketgalande1609.github.io/MyPortfolio/assets/img/profile-img.jpg"}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
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

export default HomePage;
