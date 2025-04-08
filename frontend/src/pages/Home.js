import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <div className="home-card">
        <h1 className="home-title">
          <span className="wave">👋</span> Bine ai venit!
        </h1>
        <p className="home-subtitle">Alege o opțiune pentru a continua:</p>

        <div className="home-buttons">
          <Link to="/signup" className="home-btn">📝 Înregistrare</Link>
          <Link to="/login" className="home-btn secondary">🔐 Autentificare</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
