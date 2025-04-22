import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Container, Typography, Box, Alert, Fade, useMediaQuery, Link, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { generatePasswordResetOTP, ResetPassword, verifyPasswordResetOTP } from "../services/api";
import { useNotifications } from "@toolpad/core/useNotifications";
import ParticleCanvas from "../component/ParticleCanvas";

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
            {/* Particle Background Canvas */}
            <ParticleCanvas />

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

                    {step === "email" && (
                        <form onSubmit={handleEmailSend}>
                            <TextField
                                fullWidth
                                placeholder="Email"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                disabled={loading || !email}
                                fullWidth
                                type="submit"
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    borderRadius: "12px",
                                    height: "48px",
                                    fontSize: isLarge ? "1rem" : "0.9rem",
                                    fontWeight: 600,
                                    background:
                                        loading || !email
                                            ? "rgba(122, 96, 255, 0.3)"
                                            : "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(160, 96, 255) 100%)",
                                    color: "#fff",
                                    textTransform: "none",
                                    letterSpacing: "0.5px",
                                    transition: "all 0.3s ease",
                                    "&:hover":
                                        !loading && email
                                            ? {
                                                  transform: "translateY(-2px)",
                                                  boxShadow: "0 4px 12px rgba(122, 96, 255, 0.3)",
                                                  background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(140, 96, 255) 100%)",
                                              }
                                            : {},
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} thickness={4} sx={{ color: "#fff", mr: 1 }} />
                                        Sending Email...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    )}

                    {step === "otp" && (
                        <>
                            <Typography sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}>
                                Enter the 6-digit OTP sent to <b>{email}</b>
                            </Typography>
                            <Grid container spacing={1} justifyContent="center" mb={3}>
                                {otp.map((digit, index) => (
                                    <Grid item key={index}>
                                        <TextField
                                            inputRef={(ref) => (inputRefs.current[index] = ref)}
                                            value={digit}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            InputProps={{
                                                inputProps: {
                                                    maxLength: 1,
                                                    style: {
                                                        textAlign: "center",
                                                        fontSize: "1.5rem",
                                                        color: "#fff",
                                                    },
                                                    onPaste: handleOTPPaste,
                                                },
                                            }}
                                            sx={{
                                                width: "2.65rem",
                                                "& .MuiOutlinedInput-root": {
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
                                    height: "48px",
                                    borderRadius: "12px",
                                    fontSize: isLarge ? "1rem" : "0.9rem",
                                    fontWeight: 600,
                                    background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(160, 96, 255) 100%)",
                                    color: "#fff",
                                    textTransform: "none",
                                    letterSpacing: "0.5px",
                                    transition: "all 0.3s ease",
                                    "&:hover": !loading
                                        ? {
                                              transform: "translateY(-2px)",
                                              boxShadow: "0 4px 12px rgba(122, 96, 255, 0.3)",
                                              background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(140, 96, 255) 100%)",
                                          }
                                        : {},
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} thickness={4} sx={{ color: "#fff", mr: 1 }} />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>
                        </>
                    )}

                    {step === "reset" && (
                        <>
                            <Typography sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}>Enter your new password</Typography>
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="New Password"
                                variant="outlined"
                                margin="normal"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="Confirm Password"
                                variant="outlined"
                                margin="normal"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                sx={{
                                    mb: 4,
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
                                disabled={loading}
                                fullWidth
                                onClick={handlePasswordReset}
                                sx={{
                                    height: "48px",
                                    borderRadius: "12px",
                                    fontSize: isLarge ? "1rem" : "0.9rem",
                                    fontWeight: 600,
                                    background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(160, 96, 255) 100%)",
                                    color: "#fff",
                                    textTransform: "none",
                                    letterSpacing: "0.5px",
                                    transition: "all 0.3s ease",
                                    "&:hover": !loading
                                        ? {
                                              transform: "translateY(-2px)",
                                              boxShadow: "0 4px 12px rgba(122, 96, 255, 0.3)",
                                              background: "linear-gradient(45deg, rgb(122, 96, 255) 0%, rgb(140, 96, 255) 100%)",
                                          }
                                        : {},
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} thickness={4} sx={{ color: "#fff", mr: 1 }} />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </>
                    )}

                    <Typography
                        sx={{
                            mt: 4,
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: isLarge ? "0.95rem" : "0.85rem",
                        }}
                    >
                        Remember your password?{" "}
                        <Link
                            href="/login"
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
                            Back to Login
                        </Link>
                    </Typography>
                </Box>
            </Fade>
        </Container>
    );
};

export default ForgotPasswordPage;
