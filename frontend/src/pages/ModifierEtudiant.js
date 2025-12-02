import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const ModifierEtudiant = () => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [class_id, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const student = location.state?.student;

  useEffect(() => {
    if (student) {
      setNom(student.nom || "");
      setEmail(student.email || "");
      setClassId(student.class_id || "");
    }
    
    // Charger les classes disponibles
    fetchClasses();
  }, [student]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nom || !email) {
      alert("Nom et email sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          email,
          class_id: class_id || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Étudiant modifié avec succès !");
        navigate("/etudiants");
      } else {
        alert(data.message || "Erreur lors de la modification de l'étudiant");
      }
    } catch (error) {
      console.error("Erreur modification étudiant:", error);
      alert("Erreur réseau lors de la modification de l'étudiant");
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Étudiant non trouvé</p>
        <button onClick={() => navigate("/etudiants")} style={secondaryButtonStyle}>
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={headerStyle}>
        <h1>Modifier l'Étudiant</h1>
        <button onClick={() => navigate("/etudiants")} style={secondaryButtonStyle}>
          ← Retour à la liste
        </button>
      </div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nom complet *</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
              style={inputStyle}
              placeholder="Nom complet de l'étudiant"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email *</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle}
              placeholder="email@exemple.com"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Classe</label>
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
          </div>
          
          <div style={formActionsStyle}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                ...primaryButtonStyle,
                background: loading ? "#94a3b8" : "#2563eb" 
              }}
            >
              {loading ? "Modification..." : "💾 Enregistrer les modifications"}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate("/etudiants")}
              style={secondaryButtonStyle}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles pour ModifierEtudiant
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem"
};

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "2rem",
  maxWidth: "500px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const labelStyle = {
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px"
};

const inputStyle = {
  padding: "0.75rem",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  fontSize: "1rem",
  transition: "border-color 0.2s"
};

const formActionsStyle = {
  display: "flex",
  gap: "1rem",
  marginTop: "1rem"
};

const primaryButtonStyle = { 
  padding: "0.75rem 1.5rem", 
  borderRadius: "8px", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const secondaryButtonStyle = { 
  padding: "0.75rem 1.5rem", 
  borderRadius: "8px", 
  background: "#6b7280", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px"
};

export default ModifierEtudiant;