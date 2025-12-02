// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./fichiersCSS/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // parse json safely
      let result;
      try {
        result = await res.json();
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        setError("Réponse serveur invalide");
        return;
      }

      console.log("🧭 Réponse backend:", result);

      // get the user & token supporting multiple possible shapes
      const user =
        result?.data?.user ?? result?.user ?? result?.data?.userData ?? null;
      const token = result?.data?.token ?? result?.token ?? null;

      // prefer checking result.success (backend pattern), fallback to HTTP status
      const ok =
        typeof result?.success !== "undefined" ? result.success : res.ok;

      if (ok && user) {
        // save to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        if (token) localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", user.role || "");

        console.log("💾 user saved:", user);

        // debug alert (you can remove later)
        // alert('Login OK — role: ' + (user.role || 'unknown'));

        // navigate according to role, fallback to window.location if navigate fails
        const target =
          user.role === "professeur" ? "/dashboard-prof" : "/dashboard-student";
        try {
          navigate(target);
        } catch (navErr) {
          console.warn("navigate failed, using window.location.href", navErr);
          window.location.href = target;
        }
        return;
      }

      // if not ok
      const msg =
        result?.message || result?.error || "Email ou mot de passe incorrect";
      setError(msg);
      console.warn("Login failed:", msg);
    } catch (err) {
      console.error("🔥 Erreur attrapée:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Connexion!!</h2>
        {error && (
          <div className="error-message" style={{ color: "red" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Entrez votre email"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-link">
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
