import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <Container sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h3" color="error" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="h6" paragraph>
                Sorry, the page you are looking for does not exist.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoHome}>
                Go to Home
            </Button>
        </Container>
    );
};

export default NotFoundPage;
