import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../static/logo.png";
import { useUser } from "../context/userContext";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null); // Ensure error is a string or null
    const { setUser } = useUser();

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await loginUser({ email, password });

            if (response.success) {
                const { token, user } = response.data;

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                navigate("/");
            } else {
                setError(response.error || "Login failed!"); // Ensure error is a string
            }
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Login failed!"); // Ensure error is a string
        }
    };

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const response = await googleLogin({ token: credentialResponse.credential });

            if (response.success) {
                const { token, user } = response.data;

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                navigate("/");
            } else {
                setError(response.error || "Google login failed!"); // Ensure error is a string
            }
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Google login failed!"); // Ensure error is a string
        }
    };

    return (
        <GoogleOAuthProvider clientId={"702353220748-2lmc03lb4tcfnuqds67h8bbupmb1aa0q.apps.googleusercontent.com"}>
            <Container maxWidth="xs">
                <Box sx={{ mt: 8, textAlign: "center", border: "2px solid #444", padding: "80px 30px", borderRadius: "20px" }}>
                    <img src={logo} alt="logo" width="100px" style={{ marginBottom: "20px" }} />

                    {/* Ensure error is a valid React node */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "20px",
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "20px",
                                },
                            }}
                        />
                        <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2, borderRadius: "20px" }}>
                            Login
                        </Button>
                    </form>

                    <Typography sx={{ mt: 2, mb: 2 }}>OR</Typography>

                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            setError("Google login failed!"); // Ensure error is a string
                        }}
                    />

                    <Typography sx={{ mt: 4 }}>
                        Don't have an account?{" "}
                        <Link href="/register" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                            Create an account
                        </Link>
                    </Typography>
                </Box>
            </Container>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
