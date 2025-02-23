import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material";

import { extendTheme } from "@mui/material/styles";
import AppContent from "./AppContent";

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

const App = () => {
    return (
        <ThemeProvider theme={demoTheme}>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
};

export default App;
