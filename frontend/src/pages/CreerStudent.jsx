import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreerStudent = () => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [class_id, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les classes disponibles
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/classes/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error("Erreur chargement classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nom || !email || !password) {
      alert("Nom, email et mot de passe sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      // CORRECTION : Utiliser la route d'inscription avec les bons paramètres
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          email,
          password,
          role: "student",
          class_id: class_id || null, // class_id peut être null
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Étudiant créé avec succès !");
        navigate("/etudiants");
      } else {
        alert(data.message || "Erreur lors de la création de l'étudiant");
      }
    } catch (error) {
      console.error("Erreur création étudiant:", error);
      alert("Erreur réseau lors de la création de l'étudiant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Créer un nouvel étudiant</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
        <input 
          type="text" 
          placeholder="Nom complet" 
          value={nom} 
          onChange={(e) => setNom(e.target.value)} 
          required 
          style={inputStyle}
        />
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={inputStyle}
        />
        
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={inputStyle}
        />
        
        <select 
          value={class_id} 
          onChange={(e) => setClassId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Sélectionner une classe (optionnel)</option>
          {classes.map((classe) => (
            <option key={classe.id} value={classe.id}>
              {classe.name} - {classe.niveau}
            </option>
          ))}
        </select>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "0.6rem 1rem", 
            borderRadius: "8px", 
            background: loading ? "#94a3b8" : "#16a34a", 
            color: "white", 
            border: "none", 
            cursor: loading ? "not-allowed" : "pointer" 
          }}
        >
          {loading ? "Création..." : "Créer Étudiant"}
        </button>
        
        <button 
          type="button"
          onClick={() => navigate("/etudiants")}
          style={{ 
            padding: "0.6rem 1rem", 
            borderRadius: "8px", 
            background: "#6b7280", 
            color: "white", 
            border: "none", 
            cursor: "pointer" 
          }}
        >
          Annuler
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: "0.6rem",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "1rem"
};

export default CreerStudent;