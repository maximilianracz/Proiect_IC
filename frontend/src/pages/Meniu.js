import React from "react";
import { useNavigate } from "react-router-dom";
import "./Meniu.css";

const Meniu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="meniu-page">
      <div className="meniu-card">
        <h1 className="meniu-title">Meniu Principal</h1>

        <div className="meniu-buttons">
          <button onClick={() => navigate("/harta")}>🗺️ Harta</button>
          <button onClick={() => navigate("/adauga-cerere")}>➕ Adaugă cerere donație</button>
          <button onClick={() => navigate("/top-donatori")}>🏆 Top 10 donatori</button>
          <button onClick={() => navigate("/donari-deschise")}>📦 Donații deschise</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Meniu;
