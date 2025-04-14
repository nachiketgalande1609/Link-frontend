import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Fade, useMediaQuery, Link, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { generatePasswordResetOTP, verifyPasswordResetOTP } from "../services/api";

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const isLarge = useMediaQuery("(min-width:1281px)");
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setChecked(true);
    }, []);

    const handleEmailSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await generatePasswordResetOTP(email);
            if (response.success) {
                setError(null);
                setOtpSent(true);
            } else {
                setError(response.error || "Reset password failed!");
            }
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.error || "Reset password failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Allow only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOTPVerify = async () => {
        const fullOTP = otp.join("");
        if (fullOTP.length < 6) {
            setError("Please enter the full 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            const response = await verifyPasswordResetOTP(email, fullOTP);
            if (response.success) {
                navigate("/reset-password", { state: { email } });
            } else {
                setError(response.error || "Invalid OTP!");
            }
        } catch (err: any) {
            console.error("OTP verification error:", err);
            setError(err.response?.data?.error || "OTP verification failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
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

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {!otpSent ? (
                        <form onSubmit={handleEmailSend}>
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
                                        "&:hover fieldset": {
                                            borderColor: "#767676",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#767676",
                                            boxShadow: "none",
                                        },
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                disabled={loading || !email}
                                fullWidth
                                type="submit"
                                sx={{
                                    mt: 2,
                                    borderRadius: "15px",
                                    fontSize: isLarge ? "1rem" : "0.85rem",
                                    backgroundColor: "#ffffff",
                                    ":disabled": {
                                        backgroundColor: "#202327",
                                        color: "#000000",
                                    },
                                }}
                            >
                                {loading ? "Sending..." : "Reset Password"}
                            </Button>
                        </form>
                    ) : (
                        <>
                            <Typography sx={{ mb: 2 }}>
                                Enter the 6-digit OTP sent to <b>{email}</b>
                            </Typography>
                            <Grid container spacing={1} justifyContent="center" mb={2}>
                                {otp.map((digit, index) => (
                                    <Grid item key={index}>
                                        <TextField
                                            inputRef={(ref) => (inputRefs.current[index] = ref)}
                                            value={digit}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: "1.5rem" } }}
                                            sx={{ width: "3rem" }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Button
                                variant="contained"
                                disabled={loading}
                                fullWidth
                                onClick={handleOTPVerify}
                                sx={{
                                    mt: 1,
                                    borderRadius: "15px",
                                    fontSize: isLarge ? "1rem" : "0.85rem",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </>
                    )}

                    <Typography sx={{ mt: 4, fontSize: isLarge ? "1rem" : "0.85rem" }}>
                        Remember your password?{" "}
                        <Link href="/login" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                            Back to Login
                        </Link>
                    </Typography>
                </Box>
            </Fade>
        </Container>
    );
};

export default ForgotPasswordPage;
