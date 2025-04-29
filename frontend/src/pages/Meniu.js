import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Meniu.css";

const Meniu = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const goToProfil = () => {
    navigate("/profil"); 
  };

  return (
    <div className="meniu-page">
      <div className="meniu-header">
        {username && (
          <div className="user-greeting" onClick={goToProfil} style={{ cursor: "pointer" }}>
            👋 Hello, <span className="username">{username}</span>!
          </div>
        )}
      </div>

      <div className="meniu-content">
        <div className="meniu-card">
          <h1 className="meniu-title">📋 Meniu Principal</h1>
          <p className="meniu-subtitle">Alege o acțiune pentru a continua</p>

          <div className="meniu-buttons">
            <button onClick={() => navigate("/harta")}>🗺️ Harta</button>
            <button onClick={() => navigate("/adauga-cerere")}>➕ Adaugă cerere donație</button>
            <button onClick={() => navigate("/top-donatori")}>🏆 Top 10 donatori</button>
            <button onClick={() => navigate("/donari-deschise")}>📦 Donații deschise</button>
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meniu;
