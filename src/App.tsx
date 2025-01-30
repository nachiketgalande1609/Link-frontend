import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, Typography, ThemeProvider, Menu, MenuItem } from "@mui/material";
import {
    HomeOutlined as Home,
    AccountCircleOutlined as Profile,
    ExploreOutlined as Compass,
    SearchOutlined as Search,
    Menu as MenuIcon,
    Add as AddIcon,
} from "@mui/icons-material";

import CreatePostModal from "./features/post/CreatePostModal";

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

const NAVIGATION = [
    { kind: "header", title: "Link" },
    { segment: "", title: "Home", icon: <Home sx={{ fontSize: "2rem" }} /> },
    { segment: "profile", title: "Profile", icon: <Profile sx={{ fontSize: "2rem" }} /> },
    { segment: "explore", title: "Explore", icon: <Compass sx={{ fontSize: "2rem" }} /> },
    { segment: "search", title: "Search", icon: <Search sx={{ fontSize: "2rem" }} /> },
];

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

    // Hide the drawer on login & register pages
    const hideDrawer = location.pathname === "/login" || location.pathname === "/register";

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget); // Open the menu
    };

    const handleMenuClose = () => {
        setAnchorEl(null); // Close the menu
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
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
                                    <ListItem key={index} sx={{ padding: 3 }}>
                                        <img src={logo} alt="Logo" style={{ width: "100px", height: "auto" }} />
                                    </ListItem>
                                );
                            }
                            return (
                                <ListItem
                                    key={item.segment}
                                    component={Link}
                                    to={`/${item.segment}`}
                                    style={{ textDecoration: "none", padding: "15px" }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <Typography sx={{ fontSize: "1.25rem", color: "white" }}>{item.title}</Typography>
                                </ListItem>
                            );
                        })}
                        <ListItem onClick={handleOpen} key={"create post"} style={{ textDecoration: "none", padding: "15px", cursor: "pointer" }}>
                            <ListItemIcon>
                                <AddIcon sx={{ fontSize: "2rem" }} />
                            </ListItemIcon>
                            <Typography sx={{ fontSize: "1.25rem", color: "white" }}>Create Post</Typography>
                        </ListItem>
                        <Box sx={{ flexGrow: 1 }} />
                        <ListItem onClick={handleMenuClick} style={{ textDecoration: "none", padding: "15px", cursor: "pointer" }}>
                            <ListItemIcon>
                                <MenuIcon sx={{ fontSize: "2rem" }} />
                            </ListItemIcon>
                            <Typography sx={{ fontSize: "1.25rem", color: "white" }}>More</Typography>
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
                    </Menu>
                </Drawer>
            )}
            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, padding: 3 }}>
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
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
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
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Box>
            <CreatePostModal open={modalOpen} handleClose={handleClose} />;
        </Box>
    );
};

export default App;
