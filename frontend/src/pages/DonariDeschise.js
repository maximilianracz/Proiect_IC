import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonariDeschise.css";

const DonariDeschise = () => {
  const [donatii, setDonatii] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Funcție pentru a obține datele utilizatorului curent din localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

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
    // Verifică dacă utilizatorul este logat
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Te rugăm să te autentifici înainte de a dona!");
      return;
    }
  
    console.log("ID-ul utilizatorului:", user._id);  // Log pentru a verifica ID-ul utilizatorului
    console.log("ID-ul donației:", donatieId);      // Log pentru a verifica ID-ul donației
  
    // Actualizează punctele utilizatorului
    const numarProduse = produse.length;
    const puncte = numarProduse * 10;
  
    const updatedUser = { ...user, puncte: (user.puncte || 0) + puncte };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  
    // Trimite cererea PUT
    try {
      const response = await fetch(`http://localhost:5000/donatii/${donatieId}/doneaza`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }), // Trimite ID-ul utilizatorului
      });
  
      if (response.ok) {
        setDonatii(donatii.filter(donatie => donatie._id !== donatieId));
      } else {
        console.error("Eroare la procesarea donației!");
      }
    } catch (err) {
      console.error("Eroare la procesarea donației:", err);
    }
  };
  
  

  return (
    <div className="donatii-container">
      <h2>Donări Deschise</h2>
      {donatii.length === 0 ? (
        <p>Nu există cereri de donație înregistrate.</p>
      ) : (
        donatii.map((donatie, index) => (
          <div key={donatie.id} className="donatie-card">
            <h3>{donatie.nume}</h3>
            <p><strong>Adresă:</strong> {donatie.adresa}</p>
            <ul>
              {donatie.produse.map((produs, i) => (
                <li key={i}>
                  {produs.tip} - Mărime: {produs.marime} - Cantitate: {produs.cantitate}
                </li>
              ))}
            </ul>
            <button onClick={() => handleDonate(donatie.id, donatie.produse)}>
              Donează
            </button>
          </div>
        ))
      )}
      <button className="back-btn" onClick={() => navigate("/meniu")}>Înapoi la Meniu</button>
    </div>
  );
};

export default DonariDeschise;
