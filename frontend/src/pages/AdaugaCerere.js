import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdaugaCerere.css";

const AdaugaCerere = () => {
  const [nume, setNume] = useState("");
  const [adresa, setAdresa] = useState("");
  const [produse, setProduse] = useState([{ tip: "", marime: "", cantitate: 1 }]);
  const [mesaj, setMesaj] = useState("");
  const navigate = useNavigate();

  const handleChangeProdus = (index, field, value) => {
    const newProduse = [...produse];
    newProduse[index][field] = value;
    setProduse(newProduse);
  };

  const handleAddProdus = () => {
    setProduse([...produse, { tip: "", marime: "", cantitate: 1 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/donatii", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nume, adresa, produse }),
    });

    if (response.ok) {
      setMesaj("✅ Cerere trimisă cu succes!");
      setNume("");
      setAdresa("");
      setProduse([{ tip: "", marime: "", cantitate: 1 }]);
    } else {
      setMesaj("❌ Eroare la trimitere!");
    }

    setTimeout(() => setMesaj(""), 3000); // Șterge mesajul după 3 sec
  };

  return (
    <div className="form-container">
      <h2>📥 Adaugă Cerere Donație</h2>
      {mesaj && <p className="message">{mesaj}</p>}

      <form onSubmit={handleSubmit} className="donation-form">
        <input type="text" placeholder="Nume" value={nume} onChange={(e) => setNume(e.target.value)} required />
        <input type="text" placeholder="Adresă" value={adresa} onChange={(e) => setAdresa(e.target.value)} required />
        
        {produse.map((produs, index) => (
          <div key={index} className="produs-group">
            <input
              type="text"
              placeholder="Tip produs"
              value={produs.tip}
              onChange={(e) => handleChangeProdus(index, "tip", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Mărime"
              value={produs.marime}
              onChange={(e) => handleChangeProdus(index, "marime", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Cantitate"
              min="1"
              value={produs.cantitate}
              onChange={(e) => handleChangeProdus(index, "cantitate", e.target.value)}
              required
            />
          </div>
        ))}

        <button type="button" className="btn secondary" onClick={handleAddProdus}>
          ➕ Adaugă produs
        </button>
        <button type="submit" className="btn primary">
          🚀 Trimite Cererea
        </button>
      </form>

      <button className="back-btn" onClick={() => navigate("/meniu")}>⬅️ Înapoi la Meniu</button>
    </div>
  );
};

export default AdaugaCerere;
