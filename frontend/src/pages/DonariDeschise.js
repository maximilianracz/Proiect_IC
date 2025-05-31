import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./DonariDeschise.css";

const DonariDeschise = () => {
  const [donatii, setDonatii] = useState([]);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

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

  const handleDonate = async (donatieId, produsIndex) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Te rugăm să te autentifici înainte de a dona!");
      return;
    }

    setLoading(prev => ({ ...prev, [`${donatieId}-${produsIndex}`]: true }));

    try {
      const response = await fetch(`http://localhost:5000/donatii/${donatieId}/doneaza`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: user.id,
          produsIndex: produsIndex
        }),
      });

      if (response.ok) {
        // Update local state to reflect the donation
        setDonatii(prevDonatii => 
          prevDonatii.map(d => {
            if (d._id === donatieId) {
              const updatedProduse = [...d.produse];
              updatedProduse[produsIndex] = {
                ...updatedProduse[produsIndex],
                donat: true
              };
              
              // Check if all products are donated
              const allDonated = updatedProduse.every(p => p.donat);
              const someDonated = updatedProduse.some(p => p.donat);
              
              return {
                ...d,
                produse: updatedProduse,
                status: allDonated ? "inchis" : someDonated ? "partial" : "deschis"
              };
            }
            return d;
          })
        );
        
        // Update user points in local storage
        const cantitate = donatii.find(d => d._id === donatieId)?.produse[produsIndex]?.cantitate || 1;
        const updatedUser = { 
          ...user, 
          puncte: (user.puncte || 0) + (10 * cantitate) 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setFeedback("✅ Produsul a fost donat cu succes!");
      } else {
        setFeedback("❌ Eroare la donarea produsului!");
      }
    } catch (err) {
      console.error("Eroare:", err);
      setFeedback("❌ Eroare la donarea produsului!");
    } finally {
      setLoading(prev => ({ ...prev, [`${donatieId}-${produsIndex}`]: false }));
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="donatii-container">
      <Header />
      <button className="back-button" onClick={() => navigate("/meniu")}>
        Înapoi la Meniu
      </button>

      <h2>📦 Donări Deschise</h2>
      {feedback && <p className="feedback-message">{feedback}</p>}
      {donatii.length === 0 ? (
        <p className="no-donations">Nu există cereri de donație înregistrate.</p>
      ) : (
        donatii.map((donatie) => (
          <div key={donatie._id} className="donatie-card fade-in">
            <h3>{donatie.nume} {donatie.status === "partial" && "(partial)"}</h3>
            <p><strong>📍 Adresă:</strong> {donatie.adresa}</p>
            <ul>
              {donatie.produse.map((produs, i) => (
                <li key={i}>
                  🛍️ {produs.tip} - Mărime: {produs.marime} - Cantitate: {produs.cantitate}
                  {produs.donat ? (
                    <span className="donated-badge">✓ Donat</span>
                  ) : (
                    <button
                      className="btn primary donate-item-btn"
                      onClick={() => handleDonate(donatie._id, i)}
                      disabled={loading[`${donatie._id}-${i}`]}
                    >
                      {loading[`${donatie._id}-${i}`] ? "Se procesează..." : "Donează"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default DonariDeschise;