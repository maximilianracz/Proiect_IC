import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      //alert("Login reușit!");
      navigate("/meniu");
    } else {
      setError(data.message || "Eroare la login!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">👋 Bun venit înapoi!</h2>
        <p className="login-subtitle">Autentifică-te pentru a continua</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="exemplu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-group">
            <label>Parolă</label>
            <div className="password-wrapper">
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
                aria-label="Toggle parola"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">🔐 Autentificare</button>
        </form>

        <div className="login-footer">
          <p>Nu ai cont? <a href="/signup">Creează unul</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
