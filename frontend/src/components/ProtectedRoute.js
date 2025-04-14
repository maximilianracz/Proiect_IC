import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsAuthenticated(!!user);
  }, []);

  if (isAuthenticated === null) return null; // sau un spinner

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
