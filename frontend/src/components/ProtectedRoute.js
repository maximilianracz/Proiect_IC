import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Verificăm dacă user-ul există

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;