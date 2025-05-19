import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [donatii, setDonatii] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfil = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/donatii/profil/${userData.id}`);
        const data = await response.json();

        setUser(data.user);
        setDonatii(data.donatedItems || []);
      } catch (error) {
        console.error("Eroare la încărcarea profilului:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  if (!user) {
    return <div>Nu ești logat.</div>;
  }

  return (
    <div className="profil-wrapper">
      <div className="profil-container">
        <button className="back-button" onClick={() => navigate("/meniu")}>
          ⬅️ Înapoi la Meniu
        </button>

        <div className="card user-info">
          <h1>👤 Profilul Meu</h1>
          <p><strong>Nume:</strong> {user.username}</p>
          <p><strong>Puncte:</strong> {user.puncte}</p>
        </div>

        <div className="card donatii-info">
          <h2>📦 Donațiile Efectuate</h2>
          {donatii.length === 0 ? (
            <p className="no-donations">Nu ai efectuat donații încă.</p>
          ) : (
            <div className="donatii-list">
              {donatii.map((donatie) => (
                <div key={donatie.donationId} className="donatie-card">
                  <h3>{donatie.nume}</h3>
                  <p><strong>Adresă:</strong> {donatie.adresa}</p>
                  <div className="produse">
                    <span className="produs-tag">
                      {donatie.produs.tip} ({donatie.produs.marime}) x{donatie.produs.cantitate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profil;
