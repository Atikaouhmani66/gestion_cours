import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./fichiersCSS/DashboardStudent.css";

function DashboardStudent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsCount: 0,
    averageGrade: "N/A",
    pendingAssignments: 0

  });

  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('🔍 Debug DashboardStudent:');
    console.log('User Data:', userData);
    console.log('Token:', token);
    
    if (!token || !userData) {
      console.log('❌ Token ou user manquant - Redirection vers login');
      navigate("/login");
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      console.log('User Object:', userObj);
      
      if (userObj.role !== "student") {
        console.log('❌ Rôle non étudiant:', userObj.role);
        alert("❌ Accès réservé aux étudiants");
        navigate("/login");
        return;
      }

      setUser(userObj);
      // Simuler des données de statistiques
      setStats({
        coursesCount: 6,
        assignmentsCount: 12,
        averageGrade: "14.5/20",
        pendingAssignments: 3
      });

    } catch (error) {
      console.error('❌ Erreur parsing user data:', error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate("/login");
  };

  // Navigation functions
  const navigateToCourses = () => {
    navigate("/student-courses");
  };

  const navigateToGrades = () => {
    navigate("/student-notes");
  };

  const navigateToAssignments = () => {
    navigate("/student-assignments");
  };

  const navigateToProfile = () => {
    navigate("/student-profile");
  };

  if (!user) {
    return (
      <div className="dashboard-student-loading">
        <div className="dashboard-student-spinner"></div>
        <p>Chargement des données étudiant...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-student">
      <header className="dashboard-student-header">
        <div className="dashboard-student-header-content">
          <h1 className="dashboard-student-header-title">Tableau de Bord Étudiant</h1>
          <div className="dashboard-student-user-info">
            <div className="dashboard-student-user-role">
              <span className="dashboard-student-role-badge">ÉTUDIANT</span>
              <button onClick={handleLogout} className="dashboard-student-logout-btn">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-student-main">
        <div className="dashboard-student-welcome-section">
          <h2 className="dashboard-student-welcome-title">Bonjour, {user.nom} 🎓</h2>
          <div className="dashboard-student-user-details">
            <div className="dashboard-student-info-card">
              <h3 className="dashboard-student-info-card-title">Informations Personnelles</h3>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
              <p><strong>Promotion:</strong> {user.promotion || "2023-2024"}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-student-grid">
          <div className="dashboard-student-card" onClick={navigateToCourses}>
            <div className="dashboard-student-card-icon">📚</div>
            <h3 className="dashboard-student-card-title">Mes Cours</h3>
            <p className="dashboard-student-card-description">Consulter votre emploi du temps et les matières inscrites</p>
            <button className="dashboard-student-primary-btn">Accéder aux cours</button>
          </div>

          <div className="dashboard-student-card" onClick={navigateToGrades}>
            <div className="dashboard-student-card-icon">📊</div>
            <h3 className="dashboard-student-card-title">Mes Notes</h3>
            <p className="dashboard-student-card-description">Consulter vos notes et résultats académiques détaillés</p>
            <button className="dashboard-student-primary-btn">Voir mes notes</button>
          </div>

          <div className="dashboard-student-card" onClick={navigateToAssignments}>
            <div className="dashboard-student-card-icon">📝</div>
            <h3 className="dashboard-student-card-title">Mes Devoirs</h3>
            <p className="dashboard-student-card-description">Gérer vos devoirs et travaux à rendre</p>
            <button className="dashboard-student-primary-btn">Voir les devoirs</button>
          </div>

          <div className="dashboard-student-card" onClick={navigateToProfile}>
            <div className="dashboard-student-card-icon">👤</div>
            <h3 className="dashboard-student-card-title">Mon Profil</h3>
            <p className="dashboard-student-card-description">Gérer vos informations personnelles et paramètres</p>
            <button className="dashboard-student-primary-btn">Modifier le profil</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardStudent;