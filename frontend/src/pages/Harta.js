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

// Creăm icon personalizat pentru markerii verzi
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Creăm icon personalizat pentru markerii roșii
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Harta = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  // Coordonate centru (România)
  const centerPosition = [45.9432, 24.9668];
  const zoomLevel = 7;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, []);

  useEffect(() => {
    // Obține locația utilizatorului
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Eroare la obținerea locației: ", error);
          // Poți seta o locație implicită sau afișa un mesaj de eroare
        }
      );
    } else {
      console.error("Geolocation nu este suportat de acest browser.");
      // Poți seta o locație implicită sau afișa un mesaj
    }

    const fetchDonations = async () => {
      try {
        const response = await fetch("http://localhost:5000/donatii");
        
        if (!response.ok) {
          throw new Error("Eroare la preluarea datelor");
        }
        
        const data = await response.json();
        
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
      if (!address) {
        console.warn("Adresa lipsă pentru geocoding");
        return centerPosition;
      }

      // Folosește serviciul Nominatim de la OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ro`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        // Verificăm dacă coordonatele sunt valide
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // Dacă nu avem coordonate valide, returnăm o poziție aleatorie în jurul centrului
      const randomOffset = 0.5; // Offset mai mic pentru a rămâne în România
      return {
        lat: centerPosition[0] + (Math.random() - 0.5) * randomOffset,
        lng: centerPosition[1] + (Math.random() - 0.5) * randomOffset
      };
    } catch (err) {
      console.error("Eroare geocoding:", err);
      return centerPosition;
    }
  };

  // Funcție pentru calcularea distanței între două puncte (folosind formula Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raza Pământului în kilometri
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distanța în kilometri
    return distance;
  };

  // Funcție pentru a obține distanța pe drum folosind OSRM
  const getDrivingDistance = async (startLat, startLon, endLat, endLon) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].distance / 1000; // Convertim din metri în kilometri
      }
      return null;
    } catch (error) {
      console.error("Eroare la obținerea distanței pe drum:", error);
      return null;
    }
  };

  // Funcție pentru a filtra donațiile apropiate
  const getNearbyDonations = () => {
    if (!userLocation) return donations;
    
    return donations.filter(donation => {
      if (!donation.lat || !donation.lng) return false;
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        donation.lat,
        donation.lng
      );
      return distance <= 30; // 30 km radius
    });
  };

  // Funcție pentru a determina dacă o donație este aproape
  const isNearby = (donation) => {
    if (!userLocation || !donation.lat || !donation.lng) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      donation.lat,
      donation.lng
    );
    return distance <= 30;
  };

  // Funcție pentru a obține icon-ul potrivit pentru marker
  const getMarkerIcon = (donation) => {
    if (!showNearbyOnly) return L.Icon.Default.prototype;
    return isNearby(donation) ? greenIcon : redIcon;
  };

  if (loading) {
    return <div className="loading-spinner">Se încarcă harta...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const handleGoToProfil = () => {
    navigate("/profil");
  };

  const toggleNearbyDonations = () => {
    setShowNearbyOnly(!showNearbyOnly);
  };

  return (
    <div className="harta-page">
      <div className="harta-header">
        <div className="header-buttons">
          {username && (
            <div 
              className="user-greeting" 
              onClick={handleGoToProfil}
              style={{ cursor: "pointer" }}
              title="Mergi la profil"
            >
              👋 Hello, <span className="username">{username}</span>!
            </div>
          )}
          
          <button 
            className={`nearby-button ${showNearbyOnly ? 'active' : ''}`}
            onClick={toggleNearbyDonations}
            disabled={!userLocation}
          >
            {showNearbyOnly ? 'Toate Donațiile' : 'Donații Apropiate'}
          </button>
        </div>

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

          {donations.map((donation) => {
            if (typeof donation.lat === 'number' && typeof donation.lng === 'number' && 
                !isNaN(donation.lat) && !isNaN(donation.lng)) {
              return (
                <Marker
                  key={donation._id || donation.id}
                  position={[donation.lat, donation.lng]}
                  icon={getMarkerIcon(donation)}
                >
                  <Popup>
                    <div className="donation-popup">
                      <h3>{donation.nume}</h3>
                      <p><strong>Adresă:</strong> {donation.adresa}</p>
                      {userLocation && donation.lat && donation.lng && (
                        <p>
                          <strong>Distanță:</strong>{" "}
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            donation.lat,
                            donation.lng
                          ).toFixed(2)}{" "}
                          km
                        </p>
                      )}
                      <button 
                        className="details-button"
                        onClick={() => navigate("/donari-deschise")}
                      >
                        Vezi toate donațiile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default Harta;
