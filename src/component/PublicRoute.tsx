// src/component/PublicRoute.tsx
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    children: JSX.Element;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/" />; // Redirect to homepage if logged in
    }

    return children; // Render the login or register page if not logged in
};

export default PublicRoute;
