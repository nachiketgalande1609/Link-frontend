import React from "react";
import { Box, Typography, keyframes } from "@mui/material";

// Keyframes for the typing dots animation
const blink = keyframes`
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`;

const TypingIndicator: React.FC = () => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                mb: "6px", // Reduced margin bottom
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#202327",
                    padding: "4px 8px", // Reduced padding
                    borderRadius: "8px", // Smaller border radius
                    maxWidth: "50%", // Adjust width if needed
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "2rem", // Reduced font size
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        lineHeight: "20px",
                        marginBottom: 1.5,
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            animation: `${blink} 1.4s infinite`,
                            animationDelay: "0s",
                        }}
                    >
                        .
                    </Box>
                    <Box
                        component="span"
                        sx={{
                            animation: `${blink} 1.4s infinite`,
                            animationDelay: "0.2s",
                        }}
                    >
                        .
                    </Box>
                    <Box
                        component="span"
                        sx={{
                            animation: `${blink} 1.4s infinite`,
                            animationDelay: "0.4s",
                        }}
                    >
                        .
                    </Box>
                </Typography>
            </Box>
        </Box>
    );
};

export default TypingIndicator;
