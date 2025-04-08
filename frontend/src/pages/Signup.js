import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/meniu");
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const response = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Înregistrare reușită!");
      navigate("/meniu");
    } else {
      setError(data.message || "Eroare la înregistrare!");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2 className="signup-title">Creează un cont</h2>
        <p className="signup-subtitle">Completează formularul de mai jos</p>

        {error && <div className="signup-error">{error}</div>}

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="input-group">
            <span>👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span>📧</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-group">
            <span>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Afișează/Ascunde parola"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" className="signup-button">
            Înregistrare
          </button>
        </form>

        <div className="signup-footer">
          <p>Ai deja cont? <a href="/login">Autentifică-te</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
