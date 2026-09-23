import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {

    const { user } = useAuth();

    // User is not logged in
    if (!user) {
        return <Navigate to="/login" />;
    }

    // User is logged in, but doesn't have permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    // Everything is fine
    return children;
};

export default ProtectedRoute;