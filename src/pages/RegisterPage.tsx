import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade, useMediaQuery } from "@mui/material";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const isLarge = useMediaQuery("(min-width:1281px)");

    useEffect(() => {
        setChecked(true);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        // Validate passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const response = await registerUser({
                email,
                username,
                password,
            });

            if (response.success) {
                setSuccess("Registration successful! A verification link has been sent to your email.");
            } else {
                setError(response.error || "Registration failed!");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ width: isLarge ? "440px" : "400px", display: "flex", justifyContent: "center", alignItems: "center", height: "100svh" }}>
            <Fade in={checked} timeout={2000}>
                <Box
                    sx={{
                        textAlign: "center",
                        padding: isLarge ? "80px 30px" : "30px 30px",
                        borderRadius: "20px",
                        position: "relative",
                        overflow: "hidden",
                        border: { xs: "none", sm: "2px solid transparent" },
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
                    <Typography
                        style={{
                            backgroundImage: "linear-gradient(to right,rgb(122, 96, 255),rgb(255, 136, 0))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "20px",
                            fontSize: isLarge ? "50px" : "40px",
                        }}
                        variant="h3"
                        className="lily-script-one-regular"
                    >
                        Ripple
                    </Typography>
                    <Typography gutterBottom sx={{ fontSize: isLarge ? "1rem" : "0.85rem" }}>
                        Sign up to see photos and videos from your friends.
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}
                    <form onSubmit={handleRegister}>
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
                        <TextField
                            fullWidth
                            placeholder="Username"
                            variant="outlined"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                        <TextField
                            fullWidth
                            placeholder="Confirm Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            type="submit"
                            loading={loading}
                            onClick={handleRegister}
                            disabled={loading || !email || !username || !password || !confirmPassword}
                            sx={{ mt: 2, borderRadius: "15px", fontSize: isLarge ? "1rem" : "0.85rem" }}
                        >
                            Register
                        </Button>
                    </form>
                    <Typography sx={{ mt: 4, fontSize: isLarge ? "1rem" : "0.85rem" }}>
                        Already have an account?{" "}
                        <Link href="/login" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                            Log in
                        </Link>
                    </Typography>
                </Box>
            </Fade>
        </Container>
    );
};

export default RegisterPage;
