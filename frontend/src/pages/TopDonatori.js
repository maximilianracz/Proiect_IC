import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Top10Donatori = () => {
  const [donatori, setDonatori] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Preia lista de utilizatori și sortează-o după puncte
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const sortedDonatori = storedUsers
      .filter(user => user.puncte > 0)
      .sort((a, b) => b.puncte - a.puncte)
      .slice(0, 10); // Preia doar top 10

    setDonatori(sortedDonatori);
  }, []);

  return (
    <div>
      <h2>Top 10 Donatori</h2>
      {donatori.length === 0 ? (
        <p>Nu există donatori.</p>
      ) : (
        <ul>
          {donatori.map((donator, index) => (
            <li key={index}>
              <strong>{donator.username}</strong> - {donator.puncte} puncte
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate("/meniu")}>Înapoi la Meniu</button>
    </div>
  );
};

export default Top10Donatori;
