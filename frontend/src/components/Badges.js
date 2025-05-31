import React from "react";
import "./Badges.css";

const Badges = ({ userStats }) => {
  const badges = [
    {
      id: "donatii",
      title: "Donator Dedicat",
      description: "Realizează 100 de donații",
      icon: "🎯",
      target: 100,
      current: userStats?.totalDonatii || 0,
      color: "#4CAF50"
    },
    {
      id: "ajutati",
      title: "Ajutor În Comunitate",
      description: "Ajută 10 persoane",
      icon: "🤝",
      target: 10,
      current: userStats?.persoaneAjutate || 0,
      color: "#2196F3"
    },
    {
      id: "bluze",
      title: "Donator de Bluze",
      description: "Donează 15 bluze",
      icon: "👕",
      target: 15,
      current: userStats?.bluzeDonate || 0,
      color: "#9C27B0"
    },
    {
      id: "pantaloni",
      title: "Donator de Pantaloni",
      description: "Donează 15 perechi de pantaloni",
      icon: "👖",
      target: 15,
      current: userStats?.pantaloniDonati || 0,
      color: "#FF9800"
    },
    {
      id: "incaltaminte",
      title: "Donator de Încălțăminte",
      description: "Donează 10 perechi de încălțăminte",
      icon: "👟",
      target: 10,
      current: userStats?.incaltaminteDonata || 0,
      color: "#E91E63"
    }
  ];

  return (
    <div className="badges-container">
      <h2>🏆 Badge-uri și Realizări</h2>
      <div className="badges-grid">
        {badges.map((badge) => {
          const progress = Math.min((badge.current / badge.target) * 100, 100);
          const isCompleted = badge.current >= badge.target;

          return (
            <div 
              key={badge.id} 
              className={`badge-card ${isCompleted ? 'completed' : ''}`}
              style={{ borderColor: badge.color }}
            >
              <div className="badge-icon" style={{ backgroundColor: badge.color }}>
                {badge.icon}
              </div>
              <div className="badge-info">
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: badge.color
                    }}
                  />
                </div>
                <p className="progress-text">
                  {badge.current} / {badge.target}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Badges; 