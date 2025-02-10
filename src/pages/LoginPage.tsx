import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import socket from "../services/socket";

const LoginPage: React.FC = () => {
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        setChecked(true);
    }, []);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await loginUser({ email, password });

            if (response.success) {
                const { token, user } = response.data;
                socket.emit("registerUser", user.id);
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
            <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Box
                    sx={{
                        textAlign: "center",
                        padding: "80px 30px",
                        borderRadius: "20px",
                        position: "relative",
                        overflow: "hidden",
                        border: "2px solid transparent",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "calc(100% - 4px)",
                            height: "calc(100% - 4px)",
                            borderRadius: "20px",
                            padding: "2px",
                            background: "linear-gradient(to right, rgb(122, 96, 255), rgb(255, 136, 0))",
                            WebkitMask: "linear-gradient(white, white) content-box, linear-gradient(white, white)",
                            WebkitMaskComposite: "destination-out",
                            maskComposite: "exclude",
                            zIndex: "-100",
                        },
                    }}
                >
                    <Fade in={checked} timeout={2000}>
                        <Typography
                            style={{
                                backgroundImage: "linear-gradient(to right,rgb(122, 96, 255),rgb(255, 136, 0))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "20px",
                            }}
                            variant="h3"
                            className="lily-script-one-regular"
                        >
                            Ripple
                        </Typography>
                    </Fade>
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
                        <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2, borderRadius: "15px" }}>
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
