import { Navigate } from "react-router-dom";

const isTokenExpired = (token) => {
  try {
    const tokenPart = token.split(".")[1];

    if (!tokenPart) {
      return true;
    }

    const base64 = tokenPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedBase64 =
      base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const payload = JSON.parse(atob(paddedBase64));

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch (error) {
    return true;
  }
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("admin_token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("admin_token");

    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;