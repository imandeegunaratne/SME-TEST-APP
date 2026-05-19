import { Navigate } from "react-router-dom";

/**
 * Simple client-side guard.
 * - If no token -> /login
 * - If allowRoles provided and current role not allowed -> redirect to correct home
 */
export default function ProtectedRoute({ children, allowRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    if (!allowRoles.includes(role)) {
      // Redirect user to their correct dashboard
      if (role === "SUPER_ADMIN") return <Navigate to="/super-admin" replace />;
      if (role === "BANK_ADMIN") return <Navigate to="/bank-admin-dashboard" replace />;
      return <Navigate to="/evaluator-home" replace />;
    }
  }

  return children;
}
