import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, CircularProgress, Container, Typography, Box, Button } from "@mui/material";
import { verifyUser } from "../services/api"; // This should call your /verify API
import { useNavigate } from "react-router-dom";

const VerifyAccount: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setError("Invalid or missing verification token.");
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const response = await verifyUser(token);
                if (response.success) {
                    setSuccess("Your account has been successfully verified!");
                } else {
                    setError(response.error || "Verification failed.");
                }
            } catch (err: any) {
                setError(err.response?.data?.error || "An error occurred during verification.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams]);

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
            {loading && (
                <Box>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Verifying your account...</Typography>
                </Box>
            )}

            {!loading && success && (
                <Box>
                    <Alert severity="success">{success}</Alert>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/login")}>
                        Go to Login
                    </Button>
                </Box>
            )}

            {!loading && error && (
                <Box>
                    <Alert severity="error">{error}</Alert>
                    <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate("/")}>
                        Back to Home
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default VerifyAccount;
