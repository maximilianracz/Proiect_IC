import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setError(
        "❌ Parola nouă trebuie să aibă minim 8 caractere, o literă mare, o cifră și un caracter special."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("❌ Parolele noi nu coincid.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Parola a fost schimbată cu succes.");
        setTempPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // 🔁 Redirecționează către profil după 1.5 secunde
        setTimeout(() => {
          navigate("/profil");
        }, 1500);
      } else {
        setError(data.message || "❌ Eroare la resetarea parolei.");
      }
    } catch (err) {
      setError("❌ Eroare de rețea.");
    }

    setLoading(false);
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">🔒 Schimbare parolă</h2>
        <p className="reset-subtitle">Introdu parola temporară și noua parolă</p>

        <form className="reset-form" onSubmit={handleSubmit}>
          <div className="reset-input-wrapper">
            <input
              type={showTempPassword ? "text" : "password"}
              placeholder="Parola temporară"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
              className="reset-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowTempPassword(!showTempPassword)}
            >
              {showTempPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="reset-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Parolă nouă"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="reset-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="reset-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmă parola nouă"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="reset-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "Se salvează..." : "💾 Schimbă parola"}
          </button>
        </form>

        {message && <p className="reset-message success">{message}</p>}
        {error && <p className="reset-message error">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
