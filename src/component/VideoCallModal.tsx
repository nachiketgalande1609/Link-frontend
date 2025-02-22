import React, { useEffect, useRef, useState } from "react";
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
    callerId: number;
    receiverId: number;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    pc: RTCPeerConnection | null;
    handleEndCall: () => void; // Add this line
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ open, onClose, localStream, remoteStream, handleEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => setIsMuted((prev) => !prev);
    const toggleVideo = () => setIsVideoOn((prev) => !prev);

    return (
        <Modal open={open} onClose={onClose}>
            <VideoContainer>
                {/* Remote Video */}
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
                        ref={remoteVideoRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                        autoPlay
                    />
                </Box>

                {/* Local Video */}
                <PiPContainer>
                    <video
                        ref={localVideoRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        autoPlay
                        muted
                    />
                </PiPContainer>

                {/* Control Bar */}
                <ControlBar direction="row" spacing={2}>
                    <StyledIconButton onClick={toggleMute}>{isMuted ? <MicOff /> : <Mic />}</StyledIconButton>
                    <StyledIconButton onClick={toggleVideo}>{isVideoOn ? <Videocam /> : <VideocamOff />}</StyledIconButton>
                    <EndCallButton onClick={handleEndCall}>
                        <CallEnd />
                    </EndCallButton>
                </ControlBar>
            </VideoContainer>
        </Modal>
    );
};

export default VideoCallModal;
