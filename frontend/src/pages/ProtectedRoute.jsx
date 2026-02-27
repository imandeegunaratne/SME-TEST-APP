import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role restriction
  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    // If logged in but wrong role, send to their correct home
    if (role === "EVALUATOR") {
      return <Navigate to="/evaluator-home" replace />;
    }
    if (role === "BANK_ADMIN") {
      return <Navigate to="/bank-admin-dashboard" replace />;
    }

    // Fallback
    return <Navigate to="/login" replace />;
  }

  return children;
}