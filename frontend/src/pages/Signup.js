import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const hasUppercase = (pwd) => /[A-Z]/.test(pwd);
  const hasSpecialChar = (pwd) => /[^A-Za-z0-9]/.test(pwd);
  const hasDigit = (pwd) => /[0-9]/.test(pwd);
  const isLongEnough = (pwd) => pwd.length >= 8;

  const isValidPassword = (pwd) =>
    hasUppercase(pwd) && hasSpecialChar(pwd) && isLongEnough(pwd);

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (isLongEnough(pwd)) score++;
    if (hasUppercase(pwd)) score++;
    if (hasDigit(pwd)) score++;
    if (hasSpecialChar(pwd)) score++;

    let width = `${(score / 4) * 100}%`;
    let color = "#ff4d4f";
    let label = "Slabă";
    let labelClass = "strength-weak";

    if (score === 2) {
      color = "#faad14";
      label = "Mediocră";
      labelClass = "strength-medium";
    } else if (score >= 3) {
      color = "#52c41a";
      label = "Puternică";
      labelClass = "strength-strong";
    }

    return { width, color, label, labelClass };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Te rugăm să introduci un email valid.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Parola trebuie să aibă minim 8 caractere, o literă mare și un caracter special.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/meniu");
      } else {
        setError(data.message || "Eroare la înregistrare!");
      }
    } catch (err) {
      setError("A apărut o eroare la conectare!");
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2 className="signup-title">📝 Creează un cont</h2>
        <p className="signup-subtitle">Completează formularul pentru a începe</p>

        {error && <div className="signup-error">{error}</div>}

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="username">👤</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">📧</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="password">🔒</label>
            <div className="password-wrapper">
              <input
                id="password"
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
          </div>

          {/* Reguli parolă */}
          <div className="password-rules">
            <div className={`password-rule ${isLongEnough(password) ? "valid" : "invalid"}`}>
              {isLongEnough(password) ? "✅" : "❌"} Minim 8 caractere
            </div>
            <div className={`password-rule ${hasUppercase(password) ? "valid" : "invalid"}`}>
              {hasUppercase(password) ? "✅" : "❌"} Cel puțin o literă mare
            </div>
            <div className={`password-rule ${hasSpecialChar(password) ? "valid" : "invalid"}`}>
              {hasSpecialChar(password) ? "✅" : "❌"} Cel puțin un caracter special
            </div>
          </div>

          {/* Gradatie putere parolă */}
          <div className="password-strength">
            <div
              className="password-strength-bar"
              style={{ width: strength.width, backgroundColor: strength.color }}
            ></div>
          </div>
          <div className={`strength-text ${strength.labelClass}`}>
            Siguranță parolă: {strength.label}
          </div>

          <button type="submit" className="signup-button">
            🚀 Înregistrare
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
