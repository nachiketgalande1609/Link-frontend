import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link } from "@mui/material";
import { registerUser } from "../services/api";
import logo from "../static/logo.png";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            await registerUser({ email, username, password });
            setSuccess("Registration successful!");
            setEmail("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed!");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: "center", border: "2px solid #444", padding: "80px 30px", borderRadius: "20px" }}>
                <img src={logo} alt="logo" width="100px" style={{ marginBottom: "20px" }} />

                <Typography variant="body1" gutterBottom>
                    Sign up to see photos and videos from your friends.
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <form onSubmit={handleRegister}>
                    <TextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button variant="contained" color="primary" fullWidth onClick={handleRegister} sx={{ mt: 2 }}>
                        Register
                    </Button>
                </form>
                <Typography sx={{ mt: 4 }}>
                    Already have an account?{" "}
                    <Link href="/login" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                        Log in
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default RegisterPage;
