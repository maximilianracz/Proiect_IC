import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonariDeschise.css";

const DonariDeschise = () => {
  const [donatii, setDonatii] = useState([]);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleDonate = async (donatieId, produse) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Te rugăm să te autentifici înainte de a dona!");
      return;
    }

    setLoading(true);

    const puncte = produse.length * 10;
    const updatedUser = { ...user, puncte: (user.puncte || 0) + puncte };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      const response = await fetch(`http://localhost:5000/donatii/${donatieId}/doneaza`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (response.ok) {
        setDonatii(donatii.filter(d => d._id !== donatieId));
        setFeedback("✅ Donația a fost procesată cu succes!");
      } else {
        setFeedback("❌ Eroare la procesarea donației!");
      }
    } catch (err) {
      console.error("Eroare:", err);
      setFeedback("❌ Eroare la procesarea donației!");
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="donatii-container">
      <h2>📦 Donări Deschise</h2>
      {feedback && <p className="feedback-message">{feedback}</p>}
      {donatii.length === 0 ? (
        <p className="no-donations">Nu există cereri de donație înregistrate.</p>
      ) : (
        donatii.map((donatie, index) => (
          <div key={donatie._id} className="donatie-card fade-in">
            <h3>{donatie.nume}</h3>
            <p><strong>📍 Adresă:</strong> {donatie.adresa}</p>
            <ul>
              {donatie.produse.map((produs, i) => (
                <li key={i}>
                  🛍️ {produs.tip} - Mărime: {produs.marime} - Cantitate: {produs.cantitate}
                </li>
              ))}
            </ul>
            <button
              className="btn primary"
              onClick={() => handleDonate(donatie._id, donatie.produse)}
              disabled={loading}
            >
              {loading ? "Se procesează..." : "Donează"}
            </button>
          </div>
        ))
      )}
      <button className="btn secondary back-btn" onClick={() => navigate("/meniu")}>⬅️ Înapoi la Meniu</button>
    </div>
  );
};

export default DonariDeschise;
