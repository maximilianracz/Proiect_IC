import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Harta.css";

// Configurare markeri
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Harta = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coordonate centru (România)
  const centerPosition = [45.9432, 24.9668];
  const zoomLevel = 7;

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch("http://localhost:5000/donatii");
        
        if (!response.ok) {
          throw new Error("Eroare la preluarea datelor");
        }
        
        const data = await response.json();
        
        // Transformă datele pentru a include coordonatele
        const donationsWithCoords = await Promise.all(
          data.map(async (donation) => {
            const coords = await getCoordinatesFromAddress(donation.adresa);
            return {
              ...donation,
              lat: coords.lat,
              lng: coords.lng
            };
          })
        );
        
        setDonations(donationsWithCoords);
        setLoading(false);
      } catch (err) {
        console.error("Eroare:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Funcție pentru geocoding (transformă adresă în coordonate)
  const getCoordinatesFromAddress = async (address) => {
    try {
      // Folosește serviciul Nominatim de la OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ro`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      // Fallback pentru cazul în care nu găsim coordonate
      return {
        lat: centerPosition[0] + (Math.random() - 0.5) * 2,
        lng: centerPosition[1] + (Math.random() - 0.5) * 2
      };
    } catch (err) {
      console.error("Eroare geocoding:", err);
      return centerPosition;
    }
  };

  if (loading) {
    return <div className="loading-spinner">Se încarcă harta...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="harta-page">
      <div className="harta-header">
        <h2>Harta Donațiilor</h2>
        <button 
          className="back-button"
          onClick={() => navigate("/meniu")}
        >
          Înapoi la Meniu
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          center={centerPosition}
          zoom={zoomLevel}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {donations.map((donation) => (
            <Marker
              key={donation.id}
              position={[donation.lat, donation.lng]}
            >
              <Popup>
                <div className="donation-popup">
                  <h3>{donation.nume}</h3>
                  <p><strong>Adresă:</strong> {donation.adresa}</p>
                  <button 
                    className="details-button"
                    onClick={() => navigate("/donari-deschise")}
                  >
                    Vezi toate donațiile
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Harta;