import { Navigate, useLocation } from "react-router-dom";

/**
 * Client-side route guard.
 * NOTE: This only protects the UI. The backend enforces real
 * authorization on every API call via its permission classes.
 *
 * - No token  → /login, preserving the destination for post-login redirect
 * - Wrong role → redirect to the correct home page for that role
 */
export default function ProtectedRoute({ children, allowRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    if (role === "BANK_ADMIN") return <Navigate to="/bank-admin-dashboard" replace />;
    return <Navigate to="/evaluator-home" replace />;
  }

  return children;
}
