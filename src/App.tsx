import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    Typography,
    ThemeProvider,
    Menu,
    MenuItem,
    Badge,
    IconButton,
    useMediaQuery,
    useTheme,
    BottomNavigation,
    BottomNavigationAction,
} from "@mui/material";
import {
    HomeOutlined as HomeOutlined,
    Home as HomeFilled,
    ExploreOutlined as CompassOutlined,
    Explore as CompassFilled,
    SearchOutlined as Search,
    Menu as MenuIcon,
    Add as AddIcon,
    ChatBubbleOutlineOutlined as MessageOutlined,
    ChatBubble as Message,
    FavoriteBorder,
    Favorite,
    ChevronLeft,
    ChevronRight,
} from "@mui/icons-material";

import { useUser } from "./context/userContext";
import socket from "./services/socket";

import CreatePostModal from "./component/post/CreatePostModal";

import PrivateRoute from "./component/PrivateRoute";
import PublicRoute from "./component/PublicRoute";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import { extendTheme } from "@mui/material/styles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import { getNotificationsCount } from "./services/api";

const demoTheme = extendTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: "class",
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});

const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : {};

if (currentUser) {
    socket.emit("registerUser", currentUser.id);
}

const DrawerWidth = 240;
const CollapsedDrawerWidth = 72.67;

const App = () => {
    return (
        <ThemeProvider theme={demoTheme}>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
};

const AppContent = () => {
    const { user, unreadNotificationsCount, setUnreadNotificationsCount, unreadMessagesCount, setUnreadMessagesCount } = useUser();
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);
    const toggleDrawer = () => setOpen(!open);
    const [notificationAlert, setNotificationAlert] = useState<string | null>(null);
    const hideDrawer = location.pathname === "/login" || location.pathname === "/register";
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const NAVIGATION = [
        { kind: "header", title: "Link" },
        {
            segment: "",
            title: "Home",
            icon: <HomeOutlined sx={{ fontSize: "2rem" }} />,
            filledIcon: <HomeFilled sx={{ fontSize: "2rem", color: "#000000" }} />,
        },
        {
            segment: "search",
            title: "Search",
            icon: <Search sx={{ fontSize: "2rem" }} />,
            filledIcon: <Search sx={{ fontSize: "2rem", color: "#000000" }} />,
        },
        {
            segment: `messages`,
            title: "Messages",
            icon: (
                <Badge badgeContent={unreadMessagesCount} color="error">
                    <MessageOutlined sx={{ fontSize: "2rem" }} />
                </Badge>
            ),
            filledIcon: (
                <Badge badgeContent={unreadMessagesCount} color="error">
                    <Message sx={{ fontSize: "2rem", color: "#000000" }} />
                </Badge>
            ),
        },
        {
            segment: "notifications",
            title: "Notifications",
            icon: (
                <Badge badgeContent={unreadNotificationsCount} color="error">
                    <FavoriteBorder sx={{ fontSize: "2rem" }} />
                </Badge>
            ),
            filledIcon: (
                <Badge badgeContent={unreadNotificationsCount} color="error">
                    <Favorite sx={{ fontSize: "2rem", color: "#000000" }} />
                </Badge>
            ),
        },
        {
            segment: "explore",
            title: "Explore",
            icon: <CompassOutlined sx={{ fontSize: "2rem" }} />,
            filledIcon: <CompassFilled sx={{ fontSize: "2rem", color: "#000000" }} />,
        },
        {
            segment: `profile/${currentUser.id}`,
            title: "Profile",
            icon: (
                <img
                    src={user?.profile_picture_url}
                    alt="Profile"
                    style={{
                        width: "33px",
                        height: "33px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        outline: "2px solid #ffffff",
                    }}
                />
            ),
            filledIcon: (
                <img
                    src={user?.profile_picture_url || "default-profile-pic.jpg"}
                    alt="Profile"
                    style={{
                        width: "33px",
                        height: "33px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        outline: "2px solid #000000",
                    }}
                />
            ),
        },
    ];

    // Windows Notifications Permission
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchNotificationCount = async () => {
            try {
                const response = await getNotificationsCount(user.id);
                if (response?.success) {
                    setUnreadNotificationsCount(response?.data?.unread_notifications);
                    setUnreadMessagesCount(response?.data?.unread_messages);
                }
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };

        fetchNotificationCount();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const handleUnreadCountResponse = (data: { targetUserId: string; unreadCount: number }) => {
            const { targetUserId, unreadCount } = data;
            if (targetUserId === user.id) {
                setUnreadNotificationsCount(unreadCount);
            }
        };

        socket.on("unreadCountResponse", handleUnreadCountResponse);

        return () => {
            socket.off("unreadCountResponse", handleUnreadCountResponse);
        };
    }, [user, setUnreadNotificationsCount]);

    useEffect(() => {
        if (!user) return;

        const handleNotificationAlertResponse = (data: { targetUserId: string; notificationMessage: string }) => {
            if (Notification.permission === "granted") {
                new Notification("Link", {
                    body: data.notificationMessage,
                    icon: "https://t4.ftcdn.net/jpg/01/33/48/03/360_F_133480376_PWlsZ1Bdr2SVnTRpb8jCtY59CyEBdoUt.jpg", // Optional icon URL
                });
            }
        };

        socket.on("notificationAlert", handleNotificationAlertResponse);

        return () => {
            socket.off("notificationAlert", handleNotificationAlertResponse);
        };
    }, [user, setNotificationAlert]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setAnchorEl(null);
        navigate("/login");
    };

    useEffect(() => {
        socket.on("unreadMessagesCount", (data) => {
            setUnreadMessagesCount(data.unreadCount);
        });

        return () => {
            socket.off("unreadMessagesCount");
        };
    }, []);

    return (
        <Box sx={{ display: "flex" }}>
            {!hideDrawer ? (
                !isMobile ? (
                    <Drawer
                        sx={{
                            width: open ? DrawerWidth : CollapsedDrawerWidth,
                            minWidth: open ? DrawerWidth : CollapsedDrawerWidth,
                            flexShrink: 0,
                            transition: "width 0.3s ease-in-out, min-width 0.3s ease-in-out",
                            "& .MuiDrawer-paper": {
                                width: open ? DrawerWidth : CollapsedDrawerWidth,
                                minWidth: open ? DrawerWidth : CollapsedDrawerWidth,
                                transition: "width 0.3s ease-in-out, min-width 0.3s ease-in-out, padding 0.3s ease-in-out",
                                boxSizing: "border-box",
                                backgroundColor: "black",
                                overflowX: "hidden",
                            },
                        }}
                        variant="permanent"
                        anchor="left"
                        open={open}
                    >
                        <List sx={{ padding: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                            {NAVIGATION.map((item, index) => {
                                if (item.kind === "header") {
                                    return (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: 2,
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    visibility: open ? "visible" : "hidden",
                                                    backgroundImage: "linear-gradient(to right,rgb(122, 96, 255),rgb(255, 136, 0))",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                }}
                                                sx={{
                                                    transition: "opacity 0.3s ease-in-out, visibility 0.9s ease-in-out",
                                                    opacity: open ? 1 : 0,
                                                }}
                                                variant="h3"
                                                className="lily-script-one-regular"
                                            >
                                                Ripple
                                            </Typography>
                                            <IconButton
                                                onClick={toggleDrawer}
                                                sx={{
                                                    color: "white",
                                                    transition: "transform 0.3s",
                                                    position: "absolute",
                                                    right: open ? 0 : 8,
                                                    top: 24,
                                                    borderRadius: "50%",
                                                    "&:hover": { backgroundColor: "#000000" },
                                                }}
                                            >
                                                {open ? <ChevronLeft /> : <ChevronRight />}
                                            </IconButton>
                                        </ListItem>
                                    );
                                }
                                const isActive = location.pathname === `/${item.segment}`;
                                return (
                                    <ListItem
                                        key={item.segment}
                                        component={Link}
                                        to={`/${item.segment}`}
                                        sx={{
                                            textDecoration: "none",
                                            padding: "12px 12px",
                                            borderRadius: "20px",
                                            backgroundColor: isActive ? "#ffffff" : "transparent",
                                            "&:hover": isActive ? { backgroundColor: "#ffffff" } : { backgroundColor: "#202327" },
                                            maxHeight: "62px",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            margin: "5px 0",
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: open ? 56 : "auto" }}>{isActive ? item.filledIcon : item.icon}</ListItemIcon>
                                        <Typography
                                            sx={{
                                                fontSize: "1rem",
                                                color: isActive ? "#000000" : "white",
                                                visibility: open ? "visible" : "hidden",
                                                transition: "opacity 0.5s ease-in-out, transform 0.4s ease-in-out",
                                                opacity: open ? 1 : 0,
                                                transform: open ? "translateX(0)" : "translateX(-20px)",
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                            <ListItem
                                onClick={handleOpen}
                                sx={{
                                    textDecoration: "none",
                                    padding: "12px 12px",
                                    cursor: "pointer",
                                    borderRadius: "20px",
                                    "&:hover": { backgroundColor: "#202327" },
                                    margin: "5px 0",
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: open ? 56 : "auto" }}>
                                    <AddIcon sx={{ fontSize: "2rem" }} />
                                </ListItemIcon>
                                <Typography
                                    sx={{
                                        fontSize: "1rem",
                                        color: "white",
                                        visibility: open ? "visible" : "hidden",
                                        transition: "opacity 0.5s ease-in-out, transform 0.4s ease-in-out",
                                        opacity: open ? 1 : 0,
                                        transform: open ? "translateX(0)" : "translateX(-20px)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Create Post
                                </Typography>
                            </ListItem>
                            <Box sx={{ flexGrow: 1 }} />
                            <ListItem
                                onClick={handleMenuClick}
                                sx={{
                                    textDecoration: "none",
                                    padding: "12px 12px",
                                    cursor: "pointer",
                                    borderRadius: "20px",
                                    "&:hover": { backgroundColor: "#202327" },
                                    margin: "5px 0",
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: open ? 56 : "auto" }}>
                                    <MenuIcon sx={{ fontSize: "2rem" }} />
                                </ListItemIcon>
                                <Typography
                                    sx={{
                                        fontSize: "1rem",
                                        color: "white",
                                        visibility: open ? "visible" : "hidden",
                                        transition: "opacity 0.5s ease-in-out, transform 0.4s ease-in-out",
                                        opacity: open ? 1 : 0,
                                        transform: open ? "translateX(0)" : "translateX(-20px)",
                                    }}
                                >
                                    More
                                </Typography>
                            </ListItem>
                        </List>

                        {/* Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: "top", horizontal: "left" }}
                            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                            sx={{
                                "& .MuiPaper-root": {
                                    width: "250px",
                                    padding: "3px 10px",
                                    borderRadius: "20px",
                                    backgroundColor: "#202327",
                                },
                            }}
                        >
                            <MenuItem
                                onClick={() => navigate("/settings?setting=profiledetails")}
                                sx={{ width: "100%", textAlign: "center", height: "50px", borderRadius: "15px" }}
                            >
                                Settings
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ width: "100%", textAlign: "center", height: "50px", borderRadius: "15px" }}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Drawer>
                ) : (
                    // Mobile Bottom Navigation
                    <BottomNavigation
                        showLabels
                        sx={{
                            position: "fixed",
                            bottom: -1,
                            width: "100%",
                            backgroundColor: "black",
                            zIndex: 1000,
                            height: "60px",
                            borderRadius: "10px 10px 0 0",
                        }}
                    >
                        {NAVIGATION.map((item, index) => {
                            const isActive = location.pathname === `/${item.segment}`;
                            if (item.kind != "header") {
                                return (
                                    <BottomNavigationAction
                                        key={index}
                                        icon={item.icon}
                                        component={Link}
                                        to={`/${item.segment}`}
                                        sx={{
                                            backgroundColor: isActive ? "#ffffff" : "transparent",
                                            color: isActive ? "black" : "white",
                                            "&.Mui-selected": { color: "yellow" },
                                            minWidth: "auto",
                                            padding: "0 8px",
                                            borderRadius: "10px 10px 0 0",
                                        }}
                                    />
                                );
                            }
                        })}
                    </BottomNavigation>
                )
            ) : null}
            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, padding: 0, margin: 0, width: "100%" }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile/:userId"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/messages/:userId?"
                        element={
                            <PrivateRoute>
                                <Messages />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <PrivateRoute>
                                <ExplorePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <PrivateRoute>
                                <SearchPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Box>
            <CreatePostModal open={modalOpen} handleClose={handleClose} />
        </Box>
    );
};

export default App;
