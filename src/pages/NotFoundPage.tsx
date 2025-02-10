import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SentimentDissatisfied } from "@mui/icons-material";

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <Container sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <SentimentDissatisfied sx={{ fontSize: 80, color: "error.main" }} />
                <Typography variant="h3" color="error" gutterBottom>
                    404 - Page Not Found
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Oops! The page you're looking for doesn't exist or has been moved.
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleGoHome} sx={{ mt: 2, borderRadius: "15px" }}>
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
