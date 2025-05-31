import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./TopDonatori.css";

const Top10Donatori = () => {
  const [donatori, setDonatori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonatori = async () => {
      try {
        const response = await fetch("http://localhost:5000/donatii/top");
        
        if (!response.ok) {
          throw new Error(`Eroare server: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Date de la backend:", data);
        
        const sortedDonatori = data
          .filter(user => user && (user.puncte > 0 || user.puncte === 0))
          .sort((a, b) => b.puncte - a.puncte)
          .slice(0, 10);
        
        setDonatori(sortedDonatori);
      } catch (error) {
        console.error("Eroare:", error);
        setError("Nu s-au putut încărca donatorii");
      } finally {
        setLoading(false);
      }
    };

    fetchDonatori();
  }, []);

  return (
    <div className="top-donatori-container">
      <Header />
      <button className="back-button" onClick={() => navigate("/meniu")}>
        Înapoi la Meniu
      </button>

      <div className="header">
        <h2 className="title">🏆 Top 10 Donatori</h2>
      </div>

      {error ? (
        <p className="error-message">{error}</p>
      ) : loading ? (
        <div className="loader">Se încarcă...</div>
      ) : donatori.length === 0 ? (
        <p className="no-data">Nu există donatori cu puncte.</p>
      ) : (
        <div className="table-container">
          <table className="donatori-table">
            <thead>
              <tr>
                <th>Loc</th>
                <th>Nume</th>
                <th>Puncte</th>
              </tr>
            </thead>
            <tbody>
              {donatori.map((donator, index) => (
                <tr key={donator._id || index} className="donator-row">
                  <td className="rank">{index + 1}.</td>
                  <td className="username">{donator.username || "Utilizator fără nume"}</td>
                  <td className="points">{donator.puncte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Top10Donatori;
