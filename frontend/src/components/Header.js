import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, []);

  const goToProfil = () => {
    navigate("/profil");
  };

  return (
    <div className="header">
      {username && (
        <div 
          className="user-greeting" 
          onClick={goToProfil} 
          style={{ cursor: "pointer" }}
          title="Mergi la profil"
        >
          👋 Hello, <span className="username">{username}</span>!
        </div>
      )}
    </div>
  );
};

export default Header; 