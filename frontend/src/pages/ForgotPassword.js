import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 🔹 adăugat

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Un email de resetare a fost trimis.");
      } else {
        setError(data.message || "❌ Eroare la trimitere.");
      }
    } catch (err) {
      setError("❌ Eroare de rețea.");
    }

    setLoading(false);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">🔑 Resetare parolă</h2>
        <p className="forgot-subtitle">Introdu emailul pentru a primi o parolă temporară</p>

        <form className="forgot-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email-ul tău"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-input"
          />
          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? "Se trimite..." : "📩 Trimite email"}
          </button>
        </form>

        {message && (
          <div>
            <p className="forgot-message success">{message}</p>
            <button
              className="forgot-back-button"
              onClick={() => navigate("/login")} // 🔹 merge la login
            >
              🔙 Înapoi la autentificare
            </button>
          </div>
        )}
        {error && <p className="forgot-message error">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
