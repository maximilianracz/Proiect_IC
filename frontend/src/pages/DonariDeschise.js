import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonariDeschise.css";

const DonariDeschise = () => {
  const [donatii, setDonatii] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonatii = async () => {
      try {
        const response = await fetch("http://localhost:5000/donatii");
        const data = await response.json();
        setDonatii(data);
      } catch (err) {
        console.error("Eroare la preluarea donațiilor:", err);
      }
    };

    fetchDonatii();
  }, []);

  return (
    <div className="donatii-container">
      <h2>Donări Deschise</h2>
      {donatii.length === 0 ? (
        <p>Nu există cereri de donație înregistrate.</p>
      ) : (
        donatii.map((donatie, index) => (
          <div key={index} className="donatie-card">
            <h3>{donatie.nume}</h3>
            <p><strong>Adresă:</strong> {donatie.adresa}</p>
            <ul>
              {donatie.produse.map((produs, i) => (
                <li key={i}>
                  {produs.tip} - Mărime: {produs.marime} - Cantitate: {produs.cantitate}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      <button className="back-btn" onClick={() => navigate("/meniu")}>Înapoi la Meniu</button>
    </div>
  );
};

export default DonariDeschise;
