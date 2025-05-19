import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import "./AdaugaCerere.css";

// Mapare precisă pentru traduceri
const clothingTranslations = {
  'shirt': 'Cămașă',
  't-shirt': 'Tricou',
  'pants': 'Pantaloni',
  'dress': 'Rochie',
  'jacket': 'Geacă',
  'sweater': 'Pulover',
  'coat': 'Palton',
  'blouse': 'Bluză',
  'skirt': 'Fustă',
  'jeans': 'Blugi',
  'suit': 'Costum',
  'hoodie': 'Hanorac',
  'cardigan': 'Cardigan',
  'vest': 'Vestă',
  'shorts': 'Pantaloni scurți',
  'tank top': 'Top',
  'sweatshirt': 'Tricou cu glugă',
  'polo shirt': 'Polo',
  'blazer': 'Blazer',
  'trench coat': 'Trenci',
  'sweatpants': 'Pantaloni de trening',
  'leggings': 'Leggings',
  'jumpsuit': 'Combină',
  'kimono': 'Kimono',
  'poncho': 'Poncho',
  'parka': 'Parka',
  'windbreaker': 'Vestă de vânt',
  'peacoat': 'Palton scurt',
  'overcoat': 'Palton lung',
  'raincoat': 'Pelerină',
  'swimsuit': 'Costum de baie',
  'bikini': 'Bikini',
  'underwear': 'Lenjerie intimă',
  'bra': 'Sutien',
  'socks': 'Șosete',
  'stockings': 'Ciorapi',
  'tights': 'Dresuri',
  'scarf': 'Eșarfă',
  'gloves': 'Mănuși',
  'hat': 'Pălărie',
  'cap': 'Șapcă',
  'beanie': 'Căciulă',
  'belt': 'Curea',
  'tie': 'Cravată',
  'bow tie': 'Papion',
  'suspenders': 'Bretelă'
};

const AdaugaCerere = () => {
  const [nume, setNume] = useState("");
  const [adresa, setAdresa] = useState("");
  const [produse, setProduse] = useState([{ 
    tip: "", 
    marime: "", 
    cantitate: 1,
    imagine: null,
    imaginePreview: null
  }]);
  const [mesaj, setMesaj] = useState("");
  const [username, setUsername] = useState("");
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load the MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log("Model încărcat cu succes");
      } catch (err) {
        setError('Eroare la încărcarea modelului de recunoaștere');
        console.error(err);
      }
    };
    loadModel();
  }, []);

  // Preluăm numele utilizatorului din localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, []);

  const getBestClothingMatch = (predictions) => {
    // Sortăm predicțiile după probabilitate
    const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
    
    // Căutăm prima predicție care se potrivește cu un tip de haină cunoscut
    for (const pred of sortedPredictions) {
      const className = pred.className.toLowerCase();
      for (const [key, value] of Object.entries(clothingTranslations)) {
        if (className.includes(key)) {
          return value;
        }
      }
    }
    return null;
  };

  const handleImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError("");

        // Create a temporary URL for the image
        const imageUrl = URL.createObjectURL(file);
        
        // Update the product with the image preview
        const newProduse = [...produse];
        newProduse[index] = {
          ...newProduse[index],
          imagine: file,
          imaginePreview: imageUrl
        };
        setProduse(newProduse);

        // Perform clothing recognition
        if (model) {
          const img = new Image();
          img.src = imageUrl;
          
          // Wait for the image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          console.log("Se analizează imaginea...");
          const predictions = await model.classify(img);
          console.log("Predicții:", predictions);

          const bestMatch = getBestClothingMatch(predictions);
          
          if (bestMatch) {
            console.log("Tip haină detectat:", bestMatch);
            newProduse[index].tip = bestMatch;
            setProduse([...newProduse]);
          } else {
            setError("Nu s-a putut detecta tipul hainei. Vă rugăm să introduceți manual.");
          }
        } else {
          setError("Modelul de recunoaștere nu este încărcat. Vă rugăm să așteptați.");
        }
      } catch (err) {
        console.error("Eroare la procesarea imaginii:", err);
        setError('Eroare la procesarea imaginii');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangeProdus = (index, field, value) => {
    const newProduse = [...produse];
    newProduse[index][field] = value;
    setProduse(newProduse);
  };

  const handleAddProdus = () => {
    setProduse([...produse, { 
      tip: "", 
      marime: "", 
      cantitate: 1,
      imagine: null,
      imaginePreview: null
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      // Verificare autentificare
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem('token');
      
      console.log("User data:", userData);
      console.log("Token:", token);

      // Dacă avem userData dar nu avem token, încercăm să reautentificăm
      if (userData && !token) {
        try {
          const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: userData.email,
              password: userData.password // Notă: ar trebui să avem o modalitate mai sigură de a gestiona parola
            })
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            // Continuăm cu request-ul original
          } else {
            setError("❌ Sesiunea a expirat. Veți fi redirecționat către pagina de login...");
            setTimeout(() => {
              navigate("/login");
            }, 2000);
            return;
          }
        } catch (err) {
          console.error("Eroare la reautentificare:", err);
          setError("❌ Eroare la reautentificare. Veți fi redirecționat către pagina de login...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
      }

      // Verificăm din nou token-ul după reautentificare
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setError("❌ Nu sunteți autentificat. Veți fi redirecționat către pagina de login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      // Validare date
      if (!nume || !adresa) {
        throw new Error("Toate câmpurile sunt obligatorii");
      }

      if (produse.some(produs => !produs.tip || !produs.marime || !produs.cantitate)) {
        throw new Error("Toate câmpurile produselor sunt obligatorii");
      }
      
      // Pregătim datele pentru trimitere
      const requestData = {
        nume: nume.trim(),
        adresa: adresa.trim(),
        tip: produse[0].tip.trim(),
        marime: produse[0].marime.trim(),
        cantitate: parseInt(produse[0].cantitate) || 1,
        descriere: "" // Adăugăm câmpul descriere chiar dacă este gol
      };

      // Validare suplimentară
      if (requestData.cantitate < 1) {
        throw new Error("Cantitatea trebuie să fie cel puțin 1");
      }

      console.log("Date de trimis:", JSON.stringify(requestData, null, 2));

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      };

      console.log("Se trimite cererea către server...");
      console.log("Headers:", headers);
      
      const response = await fetch("http://localhost:5000/donatii", {
        method: "POST",
        headers: headers,
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify(requestData)
      });

      console.log("Răspuns primit de la server:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseText = await response.text();
      console.log("Răspuns brut de la server:", responseText);

      if (!response.ok) {
        let errorMessage = "Eroare la procesarea cererii";
        try {
          const errorData = JSON.parse(responseText);
          console.error("Detalii eroare server:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Răspunsul nu este JSON valid:", parseError);
          errorMessage = responseText || errorMessage;
        }

        if (response.status === 401) {
          setError("❌ Sesiunea a expirat. Veți fi redirecționat către pagina de login...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        } else if (response.status === 403) {
          throw new Error("Nu aveți permisiunea de a face această operațiune.");
        } else {
          throw new Error(errorMessage);
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Nu s-a putut parsa răspunsul de succes:", parseError);
        data = { message: "Cerere procesată cu succes" };
      }

      setMesaj("✅ Cerere trimisă cu succes!");
      setNume("");
      setAdresa("");
      setProduse([{ 
        tip: "", 
        marime: "", 
        cantitate: 1,
        imagine: null,
        imaginePreview: null
      }]);

    } catch (err) {
      console.error("Eroare detaliată:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      if (err.message.includes('Failed to fetch')) {
        setError("❌ Nu se poate conecta la server. Verificați dacă serverul rulează pe portul 5000.");
      } else if (err.message.includes('NetworkError')) {
        setError("❌ Eroare de rețea. Verificați conexiunea la internet.");
      } else {
        setError(`❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMesaj("");
        setError("");
      }, 5000);
    }
  };

  const handleGoToProfil = () => {
    navigate("/profil");
  };

  return (
    <div className="form-container">
      <div className="header">
        <div className="user-greeting">
          👋 Hello, <span className="username">{username}</span>
        </div>
        <button className="back-button" onClick={() => navigate("/meniu")}>
          Înapoi la Meniu
        </button>
      </div>

      <h2>📥 Adaugă Cerere Donație</h2>
      {mesaj && <p className="message">{mesaj}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="donation-form">
        <input
          type="text"
          placeholder="Nume"
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Adresă"
          value={adresa}
          onChange={(e) => setAdresa(e.target.value)}
          required
        />
        
        {produse.map((produs, index) => (
          <div key={index} className="produs-group">
            <div className="image-upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className="file-input"
              />
              {produs.imaginePreview && (
                <div className="image-preview">
                  <img src={produs.imaginePreview} alt="Preview" />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Tip haină"
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
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Se procesează...' : '🚀 Trimite Cererea'}
        </button>
      </form>

      <button className="back-btn" onClick={() => navigate("/meniu")}>⬅️ Înapoi la Meniu</button>
    </div>
  );
};

export default AdaugaCerere;
