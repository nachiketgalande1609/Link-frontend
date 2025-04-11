import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade, useMediaQuery } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../store/store";
import socket from "../services/socket";

const LoginPage: React.FC = () => {
    const { setUser } = useGlobalStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const isLarge = useMediaQuery("(min-width:1281px)");

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
                            padding: isLarge ? "80px 30px" : "40px 30px",
                            borderRadius: "20px",
                            position: "relative",
                            overflow: "hidden",
                            border: { xs: "none", sm: "2px solid transparent" },
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
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
                                display: { xs: "none", sm: "block" },
                            },
                        }}
                    >
                        {/* Heading */}
                        <Typography
                            style={{
                                backgroundImage: "linear-gradient(to right,rgb(122, 96, 255),rgb(255, 136, 0))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: isLarge ? "20px" : "5px",
                                fontSize: isLarge ? "50px" : "40px",
                            }}
                            className="lily-script-one-regular"
                        >
                            Ripple
                        </Typography>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
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
                                slotProps={{
                                    input: {
                                        style: {
                                            fontSize: isLarge ? "1rem" : "0.85rem",
                                            padding: isLarge ? "0px" : "5px",
                                        },
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
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
                                slotProps={{
                                    input: {
                                        style: {
                                            fontSize: isLarge ? "1rem" : "0.85rem",
                                            padding: isLarge ? "0px" : "5px",
                                        },
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                    },
                                }}
                            />
                            {/* Login Button */}
                            <Button
                                variant="contained"
                                color="primary"
                                loading={loading}
                                disabled={loading || !email || !password}
                                fullWidth
                                type="submit"
                                sx={{ mt: 2, borderRadius: "15px", fontSize: isLarge ? "1rem" : "0.85rem" }}
                            >
                                Login
                            </Button>
                        </form>

                        <Typography sx={{ mt: 2, mb: 2, fontSize: isLarge ? "1rem" : "0.85rem" }}>OR</Typography>

                        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 2 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    setError("Google login failed!");
                                }}
                                theme="outline"
                                text="signin_with"
                                shape="pill"
                            />
                        </Box>

                        <Typography sx={{ mt: 4, fontSize: isLarge ? "1rem" : "0.85rem" }}>
                            Don't have an account?{" "}
                            <Link href="/register" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                                Create an account
                            </Link>
                        </Typography>
                    </Box>
                </Fade>
            </Container>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
