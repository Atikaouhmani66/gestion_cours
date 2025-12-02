import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Etudiants = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        console.error("Erreur réponse:", response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error("Erreur fetch étudiants :", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    navigate("/creer-student");
  };

  const handleViewStudent = (student) => {
    navigate(`/etudiants/${student.id}`, { state: { student } });
  };

  const handleEditStudent = (student) => {
    navigate(`/modifier-student/${student.id}`, { state: { student } });
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${studentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Étudiant supprimé avec succès !");
        fetchStudents(); // Recharger la liste
      } else {
        const data = await response.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression de l'étudiant");
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboardprof");
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement des étudiants...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      {/* En-tête avec titre et bouton retour */}
      <div style={headerStyle}>
        <h1>Liste des Étudiants</h1>
        <button 
  type="button" 
  onClick={() => navigate('/dashboard-prof')} 
  className="creer-cours-dashboard-btn"
>
  🏠 Tableau de Bord
</button>
      </div>
      
      {/* Boutons d'actions principales */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button 
          onClick={handleCreateStudent} 
          style={primaryButtonStyle}
        >
          ➕ Créer un nouvel étudiant
        </button>
        
        <button 
          onClick={fetchStudents} 
          style={secondaryButtonStyle}
        >
          🔄 Actualiser
        </button>
      </div>

      {students.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>Aucun étudiant inscrit pour le moment.</p>
          <button 
            onClick={handleCreateStudent}
            style={primaryButtonStyle}
          >
            Créer le premier étudiant
          </button>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <div style={tableHeaderStyle}>
            <span style={countBadgeStyle}>
              {students.length} étudiant{students.length > 1 ? 's' : ''}
            </span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Classe</th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={trStyle}>
                  <td style={tdStyle}>{student.id}</td>
                  <td style={tdStyle}>
                    <strong>{student.nom}</strong>
                  </td>
                  <td style={tdStyle}>{student.email}</td>
                  <td style={tdStyle}>
                    {student.class_name ? (
                      <span style={classBadgeStyle}>{student.class_name}</span>
                    ) : (
                      <span style={noClassStyle}>Non attribuée</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={roleBadgeStyle}>{student.role}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={actionsContainerStyle}>
                      <button 
                        onClick={() => handleViewStudent(student)}
                        style={viewButtonStyle}
                        title="Voir détails"
                      >
                        👁️ Voir
                      </button>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        style={editButtonStyle}
                        title="Modifier"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(student)}
                        style={deleteButtonStyle}
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{studentToDelete?.nom}</strong> ?</p>
            <p style={warningTextStyle}>Cette action est irréversible !</p>
            <div style={modalActionsStyle}>
              <button 
                onClick={handleDeleteConfirm}
                style={confirmDeleteButtonStyle}
              >
                Oui, supprimer
              </button>
              <button 
                onClick={handleDeleteCancel}
                style={cancelButtonStyle}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
  flexWrap: "wrap",
  gap: "1rem"
};

const dashboardButtonStyle = { 
  padding: "0.6rem 1.2rem", 
  borderRadius: "8px", 
  background: "#7c3aed", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const primaryButtonStyle = { 
  padding: "0.6rem 1.2rem", 
  borderRadius: "8px", 
  background: "#2563eb", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const secondaryButtonStyle = { 
  padding: "0.6rem 1.2rem", 
  borderRadius: "8px", 
  background: "#6b7280", 
  color: "white", 
  border: "none", 
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "3rem",
  color: "#6b7280",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem"
};

const tableContainerStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
};

const tableHeaderStyle = {
  background: "#f8fafc",
  padding: "1rem",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "flex-end"
};

const countBadgeStyle = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.25rem 0.75rem",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "500"
};

const tableStyle = { 
  width: "100%", 
  borderCollapse: "collapse"
};

const thStyle = { 
  borderBottom: "2px solid #e2e8f0", 
  padding: "1rem", 
  textAlign: "left", 
  background: "#f8fafc",
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px"
};

const tdStyle = { 
  borderBottom: "1px solid #f1f5f9", 
  padding: "1rem",
  color: "#4b5563",
  fontSize: "14px"
};

const trStyle = {
  transition: "background-color 0.2s"
};

const trStyleHover = {
  ...trStyle,
  backgroundColor: "#f8fafc"
};

const classBadgeStyle = {
  background: "#dcfce7",
  color: "#166534",
  padding: "0.25rem 0.5rem",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500"
};

const noClassStyle = {
  color: "#6b7280",
  fontStyle: "italic",
  fontSize: "13px"
};

const roleBadgeStyle = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.25rem 0.5rem",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500"
};

const actionsContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  justifyContent: "flex-start",
  flexWrap: "wrap"
};

const viewButtonStyle = {
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem"
};

const editButtonStyle = {
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  background: "#f59e0b",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem"
};

const deleteButtonStyle = {
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  background: "#ef4444",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "white",
  padding: "2rem",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "90%",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
};

const warningTextStyle = {
  color: "#ef4444",
  fontWeight: "500",
  fontSize: "14px",
  marginTop: "0.5rem"
};

const modalActionsStyle = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  marginTop: "1.5rem"
};

const confirmDeleteButtonStyle = {
  padding: "0.6rem 1.2rem",
  borderRadius: "6px",
  background: "#ef4444",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "500"
};

const cancelButtonStyle = {
  padding: "0.6rem 1.2rem",
  borderRadius: "6px",
  background: "#6b7280",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "500"
};

export default Etudiants;