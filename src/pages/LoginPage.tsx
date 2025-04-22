import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade, useMediaQuery, CircularProgress } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin, trackTraffic } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../store/store";
import socket from "../services/socket";
import axios from "axios";
import ParticleCanvas from "../component/ParticleCanvas";

const LoginPage: React.FC = () => {
    const { setUser } = useGlobalStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const isLarge = useMediaQuery("(min-width:1281px)");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const ipResponse = await axios.get("https://api.ipify.org?format=json");
                const locationResponse = await axios.get(`https://ipinfo.io/${ipResponse.data.ip}/json`);

                const data = {
                    ip: ipResponse.data.ip,
                    userAgent: navigator.userAgent,
                    location: locationResponse.data.city || locationResponse.data.country,
                    referrer: document.referrer,
                };

                await trackTraffic(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        setChecked(true);
    }, []);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await loginUser({ email, password });

            if (response.success) {
                const { token, user } = response.data;

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                socket.emit("registerUser", user.id);

                setUser(user);
                navigate("/");
            } else {
                setError(response.error || "Login failed!");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "Login failed!");
            setLoading(false);
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
                setError(response.error || "Google login failed!");
            }
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Google login failed!");
        }
    };

    return (
        <GoogleOAuthProvider clientId={"702353220748-2lmc03lb4tcfnuqds67h8bbupmb1aa0q.apps.googleusercontent.com"}>
            <ParticleCanvas />

            <Container
                sx={{
                    width: isLarge ? "440px" : "400px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100svh",
                }}
            >
                <Fade in={checked} timeout={1500}>
                    <Box
                        sx={{
                            textAlign: "center",
                            padding: isLarge ? "60px 40px" : "40px 30px",
                            borderRadius: "16px",
                            position: "relative",
                            overflow: "hidden",
                            backgroundColor: "rgba(15, 15, 25, 0.85)",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(122, 96, 255, 0.2)",
                            width: "100%",
                            maxWidth: "440px",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "4px",
                                background: "linear-gradient(to right, rgb(122, 96, 255), rgb(255, 136, 0))",
                            },
                        }}
                    >
                        {/* Heading */}
                        <Typography
                            sx={{
                                backgroundImage: "linear-gradient(to right, rgb(122, 96, 255), rgb(255, 136, 0))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                mb: 3,
                                fontSize: isLarge ? "52px" : "42px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                lineHeight: 1.2,
                            }}
                            className="lily-script-one-regular"
                        >
                            Ripple
                        </Typography>

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    backgroundColor: "rgba(255, 50, 50, 0.15)",
                                    border: "1px solid rgba(255, 50, 50, 0.3)",
                                    color: "#ff6b6b",
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Email Field */}
                            <TextField
                                fullWidth
                                placeholder="Email"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size={isLarge ? "medium" : "small"}
                                sx={{
                                    mb: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                                        "& fieldset": {
                                            borderColor: "rgba(255, 255, 255, 0.1)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "rgba(122, 96, 255, 0.5)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "rgba(122, 96, 255, 0.8)",
                                            boxShadow: "0 0 0 2px rgba(122, 96, 255, 0.2)",
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        color: "#fff",
                                        fontSize: isLarge ? "1rem" : "0.9rem",
                                        padding: isLarge ? "14px 16px" : "12px 14px",
                                    },
                                }}
                            />

                            {/* Password Field */}
                            <TextField
                                fullWidth
                                placeholder="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                size={isLarge ? "medium" : "small"}
                                sx={{
                                    mb: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                                        "& fieldset": {
                                            borderColor: "rgba(255, 255, 255, 0.1)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "rgba(122, 96, 255, 0.5)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "rgba(122, 96, 255, 0.8)",
                                            boxShadow: "0 0 0 2px rgba(122, 96, 255, 0.2)",
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        color: "#fff",
                                        fontSize: isLarge ? "1rem" : "0.9rem",
                                        padding: isLarge ? "14px 16px" : "12px 14px",
                                    },
                                }}
                            />

                            <Button
                                variant="contained"
                                disabled={loading || !email || !password}
                                type="submit"
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    borderRadius: "12px",
                                    height: "48px",
                                    fontSize: isLarge ? "1rem" : "0.9rem",
                                    fontWeight: 600,
                                    background: loading
                                        ? "rgba(122, 96, 255, 0.3)"
                                        : "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(160, 96, 255) 100%)",
                                    color: "#fff",
                                    textTransform: "none",
                                    letterSpacing: "0.5px",
                                    transition: "all 0.3s ease",
                                    width: "100%",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(122, 96, 255, 0.3)",
                                        background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(140, 96, 255) 100%)",
                                    },
                                    "&:disabled": {
                                        background: "rgba(122, 96, 255, 0.1)",
                                        color: "rgba(255, 255, 255, 0.3)",
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} thickness={4} sx={{ color: "#fff" }} /> : "Login"}
                            </Button>
                        </form>

                        <Box sx={{ display: "none", justifyContent: "center", width: "100%", my: 3 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => setError("Google login failed!")}
                                theme="filled_black"
                                text="signin_with"
                                shape="pill"
                            />
                        </Box>

                        <Button
                            variant="text"
                            fullWidth
                            onClick={() => navigate("/reset-password")}
                            sx={{
                                mt: 1,
                                color: "rgba(255, 255, 255, 0.7)",
                                textTransform: "none",
                                fontSize: isLarge ? "0.95rem" : "0.85rem",
                                "&:hover": {
                                    color: "rgba(122, 96, 255, 0.9)",
                                    backgroundColor: "transparent",
                                },
                            }}
                        >
                            Forgot Password?
                        </Button>

                        <Typography
                            sx={{
                                mt: 4,
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: isLarge ? "0.95rem" : "0.85rem",
                            }}
                        >
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                sx={{
                                    color: "rgba(122, 96, 255, 0.9)",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    "&:hover": {
                                        color: "rgba(160, 96, 255, 0.9)",
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Fade>
            </Container>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
