import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./context/userContext.tsx";
import { NotificationsProvider } from "@toolpad/core/useNotifications";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <NotificationsProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </NotificationsProvider>
    </StrictMode>
);
