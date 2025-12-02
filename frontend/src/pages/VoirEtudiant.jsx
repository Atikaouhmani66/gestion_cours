import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VoirEtudiant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;

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
        <h1>Détails de l'Étudiant</h1>
        <button onClick={() => navigate("/etudiants")} style={secondaryButtonStyle}>
          ← Retour à la liste
        </button>
      </div>

      <div style={cardStyle}>
        <div style={infoGridStyle}>
          <div style={infoItemStyle}>
            <label style={labelStyle}>ID:</label>
            <span style={valueStyle}>{student.id}</span>
          </div>
          
          <div style={infoItemStyle}>
            <label style={labelStyle}>Nom complet:</label>
            <span style={valueStyle}>{student.nom}</span>
          </div>
          
          <div style={infoItemStyle}>
            <label style={labelStyle}>Email:</label>
            <span style={valueStyle}>{student.email}</span>
          </div>
          
          <div style={infoItemStyle}>
            <label style={labelStyle}>Rôle:</label>
            <span style={roleBadgeStyle}>{student.role}</span>
          </div>
          
          <div style={infoItemStyle}>
            <label style={labelStyle}>Classe:</label>
            <span style={valueStyle}>{student.class_name || "Non attribuée"}</span>
          </div>
          
          <div style={infoItemStyle}>
            <label style={labelStyle}>Niveau:</label>
            <span style={valueStyle}>{student.class_niveau || "Non spécifié"}</span>
          </div>
        </div>

        <div style={actionsStyle}>
          <button 
            onClick={() => navigate(`/modifier-student/${student.id}`, { state: { student } })}
            style={primaryButtonStyle}
          >
            ✏️ Modifier cet étudiant
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles pour VoirEtudiant
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
  maxWidth: "600px"
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem",
  marginBottom: "2rem"
};

const infoItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const labelStyle = {
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px"
};

const valueStyle = {
  color: "#4b5563",
  fontSize: "16px"
};

const roleBadgeStyle = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.25rem 0.75rem",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "500",
  alignSelf: "flex-start"
};

const actionsStyle = {
  display: "flex",
  gap: "1rem",
  justifyContent: "flex-start"
};

const primaryButtonStyle = { 
  padding: "0.6rem 1.2rem", 
  borderRadius: "8px", 
  background: "#2563eb", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px"
};

const secondaryButtonStyle = { 
  padding: "0.6rem 1.2rem", 
  borderRadius: "8px", 
  background: "#6b7280", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px"
};

export default VoirEtudiant;