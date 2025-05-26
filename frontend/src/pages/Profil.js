import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [donatii, setDonatii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopDonor, setIsTopDonor] = useState(false);
  const [rank, setRank] = useState(null);

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

        // Fetch top donors to check if user is in top 3
        const topResponse = await fetch("http://localhost:5000/donatii/top");
        const topData = await topResponse.json();
        
        const sortedDonatori = topData
          .filter(user => user && (user.puncte > 0 || user.puncte === 0))
          .sort((a, b) => b.puncte - a.puncte);
        
        const userRank = sortedDonatori.findIndex(d => d._id === userData.id) + 1;
        setRank(userRank);
        setIsTopDonor(userRank <= 3 && userRank > 0);
      } catch (error) {
        console.error("Eroare la încărcarea profilului:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [navigate]);

  const generateDiploma = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner border
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Decorative corner elements
    const cornerSize = 60;
    const corners = [
      [40, 40],
      [canvas.width - 40, 40],
      [40, canvas.height - 40],
      [canvas.width - 40, canvas.height - 40]
    ];

    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cornerSize, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cornerSize);
      ctx.strokeStyle = '#28a745';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Decorative line at the top
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, 100);
    ctx.lineTo(canvas.width * 0.8, 100);
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 60px "Times New Roman"';
    ctx.textAlign = 'center';
    ctx.fillText('DIPLOMĂ DE DONATOR', canvas.width / 2, 180);

    // Decorative line below title
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, 200);
    ctx.lineTo(canvas.width * 0.8, 200);
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtitle
    ctx.font = 'italic 28px "Times New Roman"';
    ctx.fillStyle = '#495057';
    ctx.fillText('Se acordă cu multă recunoștință', canvas.width / 2, 260);

    // Name
    ctx.font = 'bold 48px "Times New Roman"';
    ctx.fillStyle = '#28a745';
    ctx.fillText(user.username, canvas.width / 2, 340);

    // Text
    ctx.font = '24px "Times New Roman"';
    ctx.fillStyle = '#495057';
    ctx.fillText('pentru generozitatea și implicarea în ajutorarea celor nevoiași', canvas.width / 2, 400);

    // Rank
    ctx.font = 'bold 32px "Times New Roman"';
    ctx.fillStyle = '#28a745';
    ctx.fillText(`Locul ${rank} în Topul Donatorilor`, canvas.width / 2, 460);

    // Decorative line above date
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, 500);
    ctx.lineTo(canvas.width * 0.8, 500);
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Date
    const today = new Date();
    ctx.font = '24px "Times New Roman"';
    ctx.fillStyle = '#495057';
    ctx.fillText(`Data: ${today.toLocaleDateString('ro-RO')}`, canvas.width / 2, 540);

    // Decorative elements at the bottom
    const drawLeaf = (x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + size, y - size,
        x + size * 2, y,
        x + size, y + size
      );
      ctx.bezierCurveTo(
        x, y + size * 2,
        x - size, y + size,
        x, y
      );
      ctx.fillStyle = '#28a745';
      ctx.fill();
    };

    // Draw decorative leaves
    drawLeaf(canvas.width * 0.2, 600, 20);
    drawLeaf(canvas.width * 0.8, 600, 20);

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `diploma_${user.username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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
          {isTopDonor && (
            <button 
              className="download-diploma-button" 
              onClick={generateDiploma}
              title="Descarcă diploma de donator"
            >
              🏆 Descarcă Diploma
            </button>
          )}

          {/* 🔐 Buton schimbare parolă */}
          <button className="reset-password-button" onClick={() => navigate("/reset-password")}>
            🔐 Schimbă parola
          </button>
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
