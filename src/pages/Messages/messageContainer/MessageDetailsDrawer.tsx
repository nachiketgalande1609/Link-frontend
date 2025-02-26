import { Typography, Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Done as DoneIcon, DoneAll as DoneAllIcon, Close as CloseIcon } from "@mui/icons-material";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    file_url: string;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
    file_name: string | null;
    file_size: string | null;
    reply_to: number | null;
    media_height: number | null;
    media_width: number | null;
    reactions?: Record<number, string> | null;
    post?: {
        post_id: number;
        file_url: string;
        media_width: number;
        media_height: number;
        content: string;
        owner: {
            user_id: number;
            username: string;
            profile_picture: string;
        };
    };
};

interface MessageDetailsDrawerProps {
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    selectedMessage?: Message | null;
}

export default function MessageDetailsDrawer({ drawerOpen, setDrawerOpen, selectedMessage }: MessageDetailsDrawerProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
                sx: {
                    width: isMobile ? "50vw" : "300px",
                    padding: 2,
                    color: "white",
                    backgroundColor: "black",
                },
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Message Details</Typography>
                <IconButton onClick={() => setDrawerOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {selectedMessage?.timestamp && (
                <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                    <Box sx={{ paddingRight: "10px" }}>
                        <DoneIcon sx={{ color: "#ffffff", fontSize: "18px", top: "2px", position: "relative" }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#ffffff",
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                            }}
                        >
                            <strong>Sent</strong>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            {new Date(selectedMessage.timestamp).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                            })}
                            ,
                            {new Date(selectedMessage.timestamp).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </Typography>
                    </Box>
                </Box>
            )}

            {selectedMessage?.delivered_timestamp && (
                <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                    <Box sx={{ paddingRight: "10px" }}>
                        <DoneAllIcon sx={{ color: "#ffffff", fontSize: "18px", top: "2px", position: "relative" }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#ffffff",
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                            }}
                        >
                            <strong>Delivered</strong>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            {new Date(selectedMessage.delivered_timestamp).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                            })}
                            ,
                            {new Date(selectedMessage.delivered_timestamp).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </Typography>
                    </Box>
                </Box>
            )}

            {selectedMessage?.read_timestamp && (
                <Box sx={{ border: "1px solid #505050", padding: "10px", borderRadius: "10px", mb: 1, display: "flex" }}>
                    <Box sx={{ paddingRight: "10px" }}>
                        <DoneAllIcon sx={{ color: "#38acff", fontSize: "18px", top: "2px", position: "relative" }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#ffffff",
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                            }}
                        >
                            <div>
                                <strong>Read</strong>
                                <br />
                            </div>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            {new Date(selectedMessage.read_timestamp).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                            })}
                            ,
                            {new Date(selectedMessage.read_timestamp).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}
