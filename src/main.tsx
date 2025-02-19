import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { NotificationsProvider } from "@toolpad/core/useNotifications";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <NotificationsProvider>
            <App />
        </NotificationsProvider>
    </StrictMode>
);
