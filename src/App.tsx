import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, Typography, ThemeProvider, Menu, MenuItem } from "@mui/material";
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
} from "@mui/icons-material";

import { useUser } from "./context/userContext";

import CreatePostModal from "./component/post/CreatePostModal";

import PrivateRoute from "./component/PrivateRoute";
import PublicRoute from "./component/PublicRoute";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import { extendTheme } from "@mui/material/styles";
import logo from "./static/logo.png";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";

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

const currentUser = JSON.parse(localStorage.getItem("user") || "");

const DrawerWidth = 240;

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
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const toggleDrawer = () => setOpen(!open);

    const hideDrawer = location.pathname === "/login" || location.pathname === "/register";

    const { user } = useUser();

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
            icon: <MessageOutlined sx={{ fontSize: "2rem" }} />,
            filledIcon: <Message sx={{ fontSize: "2rem", color: "#000000" }} />,
        },
        {
            segment: "notifications",
            title: "Notifications",
            icon: <FavoriteBorder sx={{ fontSize: "2rem" }} />,
            filledIcon: <Favorite sx={{ fontSize: "2rem", color: "#000000" }} />,
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
                        width: "40px",
                        height: "40px",
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
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        outline: "2px solid #000000",
                    }}
                />
            ),
        },
    ];

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

    return (
        <Box sx={{ display: "flex" }}>
            {!hideDrawer && (
                <Drawer
                    sx={{
                        width: DrawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: DrawerWidth,
                            boxSizing: "border-box",
                            backgroundColor: "black",
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open}
                >
                    <List sx={{ padding: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                        {NAVIGATION.map((item, index) => {
                            if (item.kind === "header") {
                                return (
                                    <ListItem key={index} sx={{ padding: 3, mb: 3 }}>
                                        <img src={logo} alt="Logo" style={{ width: "100px", height: "auto" }} />
                                    </ListItem>
                                );
                            }
                            const isActive = location.pathname === `/${item.segment}`;
                            return (
                                <ListItem
                                    key={item.segment}
                                    component={Link}
                                    to={`/${item.segment}`}
                                    style={{
                                        textDecoration: "none",
                                        padding: "15px",
                                        borderRadius: "20px",
                                    }}
                                    sx={{
                                        backgroundColor: isActive ? "#ffffff" : "transparent",
                                        "&:hover": isActive ? { backgroundColor: "#ffffff" } : { backgroundColor: "#222222" },
                                        maxHeight: "62px",
                                    }}
                                >
                                    <ListItemIcon>{isActive ? item.filledIcon : item.icon}</ListItemIcon>
                                    <Typography sx={{ fontSize: "1rem", color: isActive ? "#000000" : "white", fontWeight: "444444" }}>
                                        {item.title}
                                    </Typography>
                                </ListItem>
                            );
                        })}
                        <ListItem
                            onClick={handleOpen}
                            key={"create post"}
                            style={{ textDecoration: "none", padding: "15px", cursor: "pointer", borderRadius: "20px" }}
                            sx={{
                                "&:hover": { backgroundColor: "#222" },
                            }}
                        >
                            <ListItemIcon>
                                <AddIcon sx={{ fontSize: "2rem" }} />
                            </ListItemIcon>
                            <Typography sx={{ fontSize: "1rem", color: "white", fontWeight: "333" }}>Create Post</Typography>
                        </ListItem>
                        <Box sx={{ flexGrow: 1 }} />
                        <ListItem
                            onClick={handleMenuClick}
                            style={{ textDecoration: "none", padding: "15px", cursor: "pointer", borderRadius: "20px" }}
                            sx={{
                                "&:hover": { backgroundColor: "#222" },
                            }}
                        >
                            <ListItemIcon>
                                <MenuIcon sx={{ fontSize: "2rem" }} />
                            </ListItemIcon>
                            <Typography sx={{ fontSize: "1rem", color: "white", fontWeight: "333" }}>More</Typography>
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
                            },
                        }}
                    >
                        <MenuItem onClick={handleLogout} sx={{ width: "100%", textAlign: "center", height: "50px", borderRadius: "15px" }}>
                            Logout
                        </MenuItem>
                        <MenuItem
                            onClick={() => navigate("/settings")}
                            sx={{ width: "100%", textAlign: "center", height: "50px", borderRadius: "15px" }}
                        >
                            Settings
                        </MenuItem>
                    </Menu>
                </Drawer>
            )}
            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, padding: 0, margin: 0 }}>
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
