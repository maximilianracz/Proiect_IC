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
      console.log("Sending donation request:", {
        donatieId,
        produsIndex,
        userId: user.id
      });

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Eroare la donarea produsului!");
      }

      const data = await response.json();
      
      setDonatii(prevDonatii => 
        prevDonatii.map(d => {
          if (d._id === donatieId) {
            const updatedProduse = [...d.produse];
            updatedProduse[produsIndex] = {
              ...updatedProduse[produsIndex],
              donat: true
            };
            
            return {
              ...d,
              produse: updatedProduse,
              status: data.donationStatus
            };
          }
          return d;
        })
      );
      
      const updatedUser = { 
        ...user, 
        puncte: data.newPoints
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setFeedback("✅ Produsul a fost donat cu succes!");
    } catch (err) {
      console.error("Eroare:", err);
      setFeedback(`❌ ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [`${donatieId}-${produsIndex}`]: false }));
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            {donatie.dataDonatie && donatie.oraDonatie && (
              <div className="donation-time">
                <p><strong>📅 Data:</strong> {formatDate(donatie.dataDonatie)}</p>
                <p><strong>⏰ Ora:</strong> {donatie.oraDonatie}</p>
              </div>
            )}
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