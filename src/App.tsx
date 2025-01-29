import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, IconButton, Typography, ThemeProvider } from "@mui/material";
import { HomeOutlined as Home, AccountCircleOutlined as Profile, ExploreOutlined as Compass, SearchOutlined as Search } from "@mui/icons-material";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import { extendTheme } from "@mui/material/styles";
import logo from "./static/logo.png";

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
    {
        kind: "header",
        title: "Link",
    },
    {
        segment: "",
        title: "Home",
        icon: <Home sx={{ fontSize: "2rem" }} />,
    },
    {
        segment: "profile",
        title: "Profile",
        icon: <Profile sx={{ fontSize: "2rem" }} />,
    },
    {
        segment: "explore",
        title: "Explore",
        icon: <Compass sx={{ fontSize: "2rem" }} />,
    },
    {
        segment: "search",
        title: "Search",
        icon: <Search sx={{ fontSize: "2rem" }} />,
    },
];

const DrawerWidth = 240; // Width for the sidebar

const App = () => {
    const [open, setOpen] = useState(true);

    const toggleDrawer = () => setOpen(!open);

    return (
        <ThemeProvider theme={demoTheme}>
            <Router>
                <Box sx={{ display: "flex" }}>
                    {/* Sidebar */}
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
                        <List sx={{ padding: 1 }}>
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
                        </List>
                    </Drawer>

                    {/* Main content */}
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            padding: 3,
                        }}
                    >
                        {/* Toggle button for the drawer */}
                        <IconButton
                            onClick={toggleDrawer}
                            sx={{
                                display: { sm: "none", xs: "block" }, // Only show on mobile
                                position: "absolute",
                                top: 20,
                                left: 20,
                            }}
                        >
                            <Home />
                        </IconButton>

                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/explore" element={<ExplorePage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;
