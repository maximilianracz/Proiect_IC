import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Top10Donatori.css"; // Asigură-te că ai acest fișier CSS

const Top10Donatori = () => {
  const [donatori, setDonatori] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const sortedDonatori = storedUsers
      .filter(user => user.puncte > 0)
      .sort((a, b) => b.puncte - a.puncte)
      .slice(0, 10);

    setDonatori(sortedDonatori);
    setTimeout(() => setLoading(false), 500); // Simulează încărcare
  }, []);

  return (
    <div className="container">
      <h2 className="title">🏆 Top 10 Donatori</h2>

      {loading ? (
        <div className="loader"></div>
      ) : donatori.length === 0 ? (
        <p className="no-data">Nu există donatori.</p>
      ) : (
        <ul className="donatori-list">
          {donatori.map((donator, index) => (
            <li className="donator-card" key={index}>
              <div className="rank">{index + 1}.</div>
              <div className="info">
                <p className="username">{donator.username}</p>
                <p className="points">{donator.puncte} puncte</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="back-button" onClick={() => navigate("/meniu")}>
        Înapoi la Meniu
      </button>
    </div>
  );
};

export default Top10Donatori;
