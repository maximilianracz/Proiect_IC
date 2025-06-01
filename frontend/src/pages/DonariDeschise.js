import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./DonariDeschise.css";

const CountdownTimer = ({ targetDate, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(`${targetDate}T${targetTime}`);
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  return (
    <div className="countdown-timer">
      <div className="countdown-item">
        <span className="countdown-value">{timeLeft.days}</span>
        <span className="countdown-label">zile</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value">{timeLeft.hours}</span>
        <span className="countdown-label">ore</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value">{timeLeft.minutes}</span>
        <span className="countdown-label">min</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value">{timeLeft.seconds}</span>
        <span className="countdown-label">sec</span>
      </div>
    </div>
  );
};

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
              <div className="donation-countdown">
                <p className="countdown-title">⏰ Timp rămas până la donație:</p>
                <CountdownTimer 
                  targetDate={donatie.dataDonatie} 
                  targetTime={donatie.oraDonatie} 
                />
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