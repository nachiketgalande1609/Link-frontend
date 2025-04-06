import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Link, Fade } from "@mui/material";
import { registerUser } from "../services/api";
import { useGlobalStore } from "../store/store";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const { setUser } = useGlobalStore();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

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
            // // Step 1: Generate the public-private key pair
            // const keyPair = await window.crypto.subtle.generateKey(
            //     {
            //         name: "RSA-OAEP",
            //         modulusLength: 2048, // Key size
            //         publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
            //         hash: { name: "SHA-256" }, // Hash algorithm
            //     },
            //     true, // Whether the key is extractable
            //     ["encrypt", "decrypt"] // Key usages
            // );

            // // Step 2: Export the public key
            // const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);

            // // Step 3: Export the private key
            // const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            // // Step 4: Convert exported keys to base64 strings
            // const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
            // const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)));

            // // Step 5: Encrypt the private key with the user's password
            // const encryptedPrivateKeyBase64 = await encryptPrivateKey(privateKeyBase64, password);

            // Step 6: Send the registration data to the backend
            const response = await registerUser({
                email,
                username,
                password,
                publicKey: "publicKeyBase64",
                encryptedPrivateKey: "encryptedPrivateKeyBase64",
            });

            if (response.success) {
                // Store the token and user details in localStorage
                const { token, user } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // Save the unencrypted private key in localStorage (temporarily)
                localStorage.setItem("privateKey", "privateKeyBase64");

                setUser(user);
                setSuccess("Registration successful!");
                navigate("/");
            } else {
                setError(response.error || "Registration failed!");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    // const encryptPrivateKey = async (privateKeyBase64: string, password: string) => {
    //     try {
    //         // Step 1: Generate a random 12-byte IV for AES-GCM
    //         const iv = window.crypto.getRandomValues(new Uint8Array(12));

    //         // Step 2: Derive a valid AES key from the password
    //         const aesKey = await deriveAesKeyFromPassword(password);

    //         // Step 3: Convert the private key (base64 string) to an ArrayBuffer
    //         const privateKeyArrayBuffer = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0));

    //         // Step 4: Encrypt the private key using AES-GCM
    //         const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    //             {
    //                 name: "AES-GCM",
    //                 iv: iv, // Use the random IV
    //             },
    //             aesKey, // Derived AES key
    //             privateKeyArrayBuffer // Private key as ArrayBuffer
    //         );

    //         // Step 5: Combine the IV and encrypted private key into a single ArrayBuffer
    //         const combinedBuffer = new Uint8Array(iv.length + encryptedPrivateKey.byteLength);
    //         combinedBuffer.set(iv, 0); // Add the IV at the beginning
    //         combinedBuffer.set(new Uint8Array(encryptedPrivateKey), iv.length); // Add the encrypted data

    //         // Step 6: Convert the combined buffer to a base64 string
    //         const encryptedPrivateKeyBase64 = btoa(String.fromCharCode(...combinedBuffer));

    //         return encryptedPrivateKeyBase64;
    //     } catch (error) {
    //         console.error("Error encrypting private key:", error);
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

    return (
        <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Fade in={checked} timeout={2000}>
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
                    <Typography variant="body1" gutterBottom>
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
                            sx={{ mt: 2, borderRadius: "15px", height: "38.67px" }}
                        >
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
            </Fade>
        </Container>
    );
};

export default RegisterPage;
