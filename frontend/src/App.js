import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Meniu from "./pages/Meniu";
import Harta from "./pages/Harta";
import AdaugaCerere from "./pages/AdaugaCerere";
import TopDonatori from "./pages/TopDonatori";
import DonariDeschise from "./pages/DonariDeschise";
import Profil from "./pages/Profil";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />

        
        <Route
          path="/meniu"
          element={
            <ProtectedRoute>
              <Meniu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/harta"
          element={
            <ProtectedRoute>
              <Harta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adauga-cerere"
          element={
            <ProtectedRoute>
              <AdaugaCerere />
            </ProtectedRoute>
          }
        />
        <Route
          path="/top-donatori"
          element={
            <ProtectedRoute>
              <TopDonatori />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donari-deschise"
          element={
            <ProtectedRoute>
              <DonariDeschise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
