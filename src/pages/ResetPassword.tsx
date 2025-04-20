import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Fade, useMediaQuery, Link, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { generatePasswordResetOTP, ResetPassword, verifyPasswordResetOTP } from "../services/api";
import { useNotifications } from "@toolpad/core/useNotifications";

const ForgotPasswordPage: React.FC = () => {
    const notifications = useNotifications();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");

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
                setStep("otp");
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
        if (!/^\d*$/.test(value)) return;
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
                setError(null);
                setStep("reset");
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

    const handlePasswordReset = async () => {
        setError(null);
        if (!newPassword || !confirmPassword) {
            setError("Please fill in both fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const fullOTP = otp.join("");
            const response = await ResetPassword(email, fullOTP, newPassword);

            if (response.success) {
                notifications.show("Password has been reset successfully! Redirecting to login...", {
                    severity: "success",
                    autoHideDuration: 3000,
                });

                setTimeout(() => {
                    navigate("/login", { state: { resetSuccess: true } });
                }, 3000);
            } else {
                setError(response.error || "Password reset failed.");
            }
        } catch (err: any) {
            console.error("Reset error:", err);
            setError(err.message || "Password reset failed.");
        }
    };

    const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(paste)) {
            const otpArray = paste.split("");
            setOtp(otpArray);
            otpArray.forEach((digit: string, i: number) => {
                if (inputRefs.current[i]) {
                    inputRefs.current[i].value = digit;
                }
            });
            const lastIndex = Math.min(otpArray.length - 1, inputRefs.current.length - 1);
            if (inputRefs.current[lastIndex]) {
                inputRefs.current[lastIndex].focus();
            }
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

                    {step === "email" && (
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
                                {loading ? "Sending Email..." : "Reset Password"}
                            </Button>
                        </form>
                    )}

                    {step === "otp" && (
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
                                            InputProps={{
                                                inputProps: {
                                                    maxLength: 1,
                                                    style: { textAlign: "center", fontSize: "1.5rem" },
                                                    onPaste: handleOTPPaste, // ✅ Correctly typed here
                                                },
                                            }}
                                            sx={{
                                                width: "3rem",
                                                "& .MuiOutlinedInput-root": {
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

                    {step === "reset" && (
                        <>
                            <Typography sx={{ mb: 2 }}>Enter your new password</Typography>
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="New Password"
                                variant="outlined"
                                margin="normal"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="Confirm Password"
                                variant="outlined"
                                margin="normal"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                disabled={loading}
                                fullWidth
                                onClick={handlePasswordReset}
                                sx={{
                                    mt: 2.5,
                                    borderRadius: "15px",
                                    fontSize: isLarge ? "1rem" : "0.85rem",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
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
