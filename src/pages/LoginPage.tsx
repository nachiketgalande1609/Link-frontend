import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link } from "@mui/material";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../static/logo.png";
import { useUser } from "../context/userContext";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useUser();

    const navigate = useNavigate();

    const handleLogin = async () => {
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
                setError(response.error || "Login failed!");
            }
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Login failed!");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: "center", border: "2px solid #444", padding: "80px 30px", borderRadius: "20px" }}>
                <img src={logo} alt="logo" width="100px" style={{ marginBottom: "20px" }} />

                {error && <Alert severity="error">{error}</Alert>}

                <TextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
                    Login
                </Button>
                <Typography sx={{ mt: 4 }}>
                    Don't have an account?{" "}
                    <Link href="/register" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                        Create an account
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default LoginPage;
