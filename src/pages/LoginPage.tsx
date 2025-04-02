import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade } from "@mui/material";
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

    useEffect(() => {
        setChecked(true);
    }, []);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Step 1: Call the login API
            const response = await loginUser({ email, password });

            if (response.success) {
                const { token, user, encryptedPrivateKey } = response.data;

                console.log(encryptedPrivateKey);

                // Step 2: Decrypt the private key using the user's password
                // const privateKeyBase64 = await decryptPrivateKey(encryptedPrivateKey, password);

                // Step 3: Store the token, user details, and decrypted private key in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                // localStorage.setItem("privateKey", privateKeyBase64); // Store the decrypted private key

                // Step 4: Register the user with the socket (if needed)
                socket.emit("registerUser", user.id);

                // Step 5: Update the user state and navigate to the home page
                setUser(user);
                navigate("/");
            } else {
                setError(response.error || "Login failed!"); // Ensure error is a string
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "Login failed!"); // Ensure error is a string
        } finally {
            setLoading(false);
        }
    };

    // const decryptPrivateKey = async (encryptedPrivateKeyBase64: string, password: string) => {
    //     try {
    //         // Step 1: Decode the base64 string into an ArrayBuffer
    //         const combinedBuffer = Uint8Array.from(atob(encryptedPrivateKeyBase64), (c) => c.charCodeAt(0));

    //         // Step 2: Extract the IV (first 12 bytes)
    //         const iv = combinedBuffer.slice(0, 12);

    //         // Step 3: Extract the encrypted data (remaining bytes)
    //         const encryptedData = combinedBuffer.slice(12);

    //         // Step 4: Derive the AES key from the password
    //         const aesKey = await deriveAesKeyFromPassword(password);

    //         // Step 5: Decrypt the data
    //         const decryptedPrivateKey = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedData);

    //         // Step 6: Convert the decrypted data to a base64 string
    //         const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(decryptedPrivateKey)));
    //         return privateKeyBase64;
    //     } catch (error) {
    //         console.error("Error decrypting private key:", error);
    //         throw error;
    //     }
    // };

    // const deriveAesKeyFromPassword = async (password: string) => {
    //     const encoder = new TextEncoder();
    //     const passwordBuffer = encoder.encode(password);

    //     // Use PBKDF2 to derive a 256-bit (32-byte) key from the password
    //     const baseKey = await window.crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveKey"]);

    //     const aesKey = await window.crypto.subtle.deriveKey(
    //         {
    //             name: "PBKDF2",
    //             salt: new TextEncoder().encode("some-random-salt"), // Use a random or fixed salt
    //             iterations: 100000, // Number of iterations
    //             hash: "SHA-256", // Hash function
    //         },
    //         baseKey,
    //         { name: "AES-GCM", length: 256 }, // Derive a 256-bit AES key
    //         false, // Not extractable
    //         ["encrypt", "decrypt"] // Key usages
    //     );

    //     return aesKey;
    // };

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
                <Fade in={checked} timeout={1500}>
                    <Box
                        sx={{
                            textAlign: "center",
                            padding: "80px 30px",
                            borderRadius: "20px",
                            position: "relative",
                            overflow: "hidden",
                            border: "2px solid transparent",
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
                            },
                        }}
                    >
                        {/* Heading */}
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
                            {/* Password Field */}
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
                            {/* Login Button */}
                            <Button
                                variant="contained"
                                color="primary"
                                loading={loading}
                                disabled={loading || !email || !password}
                                fullWidth
                                type="submit"
                                sx={{ mt: 2, borderRadius: "15px" }}
                            >
                                Login
                            </Button>
                        </form>

                        <Typography sx={{ mt: 2, mb: 2 }}>OR</Typography>

                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                setError("Google login failed!");
                            }}
                            theme="outline"
                            text="signin_with"
                            shape="pill"
                            width="100%"
                        />

                        <Typography sx={{ mt: 4 }}>
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
