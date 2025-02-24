import { Dialog, useTheme, useMediaQuery, Button } from "@mui/material";

interface MessageOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    onInfo: () => void;
}

const MessageOptionsDialog = ({ open, onClose, onDelete, onInfo }: MessageOptionsDialogProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: "20px",
                    backgroundColor: "rgba(32, 35, 39, 0.9)",
                    color: "white",
                    textAlign: "center",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                },
            }}
        >
            <Button
                fullWidth
                onClick={onDelete}
                sx={{
                    padding: "10px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    backgroundColor: "#202327",
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { backgroundColor: "#2e3238" },
                    borderBottom: "1px solid #505050",
                }}
            >
                Delete Message
            </Button>

            <Button
                fullWidth
                onClick={onInfo}
                sx={{
                    padding: "10px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    backgroundColor: "#202327",
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { backgroundColor: "#2e3238" },
                    borderBottom: "1px solid #505050",
                }}
            >
                Message Info
            </Button>
            <Button
                fullWidth
                onClick={onClose}
                sx={{
                    padding: "10px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    backgroundColor: "#202327",
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { backgroundColor: "#2e3238" },
                }}
            >
                Cancel
            </Button>
        </Dialog>
    );
};

export default MessageOptionsDialog;
