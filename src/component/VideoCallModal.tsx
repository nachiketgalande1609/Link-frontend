import React, { useState } from "react";
import { Box, Modal, IconButton, Button, Stack, styled } from "@mui/material";
import { CallEnd, Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material";

// Dark theme styling
const darkTheme = {
    background: "#121212",
    text: "#ffffff",
    primary: "#90caf9",
    secondary: "#f48fb1",
};

// Styled components
const VideoContainer = styled(Box)({
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: darkTheme.background,
    borderRadius: "8px",
    overflow: "hidden",
});

const PiPContainer = styled(Box)({
    position: "absolute",
    bottom: "20px",
    right: "20px",
    width: "200px",
    height: "150px",
    backgroundColor: darkTheme.background,
    borderRadius: "8px",
    overflow: "hidden",
    border: `2px solid ${darkTheme.primary}`,
    cursor: "pointer",
});

const ControlBar = styled(Stack)({
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "24px",
    padding: "8px",
});

const StyledIconButton = styled(IconButton)({
    color: darkTheme.text,
    "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
});

const EndCallButton = styled(Button)({
    backgroundColor: "#ff4444",
    color: darkTheme.text,
    borderRadius: "24px",
    padding: "8px 24px",
    "&:hover": {
        backgroundColor: "#cc0000",
    },
});

interface VideoCallModalProps {
    open: boolean;
    onClose: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ open, onClose }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isPiPMaximized, setIsPiPMaximized] = useState(false);

    const toggleMute = () => setIsMuted((prev) => !prev);
    const toggleVideo = () => setIsVideoOn((prev) => !prev);
    const togglePiP = () => setIsPiPMaximized((prev) => !prev);

    // Video sources
    const mainVideoSrc = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Replace with your main video source
    const pipVideoSrc = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"; // Replace with your PiP video source

    return (
        <Modal open={open} onClose={onClose}>
            <VideoContainer>
                {/* Main Video Screen */}
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: darkTheme.background,
                    }}
                >
                    <video
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                        autoPlay
                        muted={isMuted}
                        src={isPiPMaximized ? pipVideoSrc : mainVideoSrc}
                    />
                </Box>

                {/* PiP Video Screen */}
                <PiPContainer onClick={togglePiP}>
                    <video
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        autoPlay
                        muted={isMuted}
                        src={isPiPMaximized ? mainVideoSrc : pipVideoSrc}
                    />
                </PiPContainer>

                {/* Control Bar */}
                <ControlBar direction="row" spacing={2}>
                    <StyledIconButton onClick={toggleMute}>{isMuted ? <MicOff /> : <Mic />}</StyledIconButton>
                    <StyledIconButton onClick={toggleVideo}>{isVideoOn ? <Videocam /> : <VideocamOff />}</StyledIconButton>
                    <EndCallButton onClick={onClose}>
                        <CallEnd />
                    </EndCallButton>
                </ControlBar>
            </VideoContainer>
        </Modal>
    );
};

export default VideoCallModal;
