import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./fichiersCSS/DashboardProf.css";

const DashboardProf = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const userObj = JSON.parse(userData);
      if (userObj.role !== "professeur") {
        alert("❌ Accès réservé aux professeurs");
        navigate("/login");
        return;
      }

      setUser(userObj);
      await fetchTeacherStats(userObj.id);
    };

    fetchUserData();
  }, [navigate]);

  // Fonction pour récupérer les vraies statistiques depuis l'API
  const fetchTeacherStats = async (teacherId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Appel API réel vers votre backend
      const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Erreur lors de la récupération des statistiques");
        // Valeurs par défaut si l'API échoue
        setStats({
          coursesCount: 0,
          studentsCount: 0,
          pendingAssignments: 0,
          successRate: 0
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setStats({
        coursesCount: 0,
        studentsCount: 0,
        pendingAssignments: 0,
        successRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les cours récents
  const fetchRecentCourses = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/recent-courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Erreur cours récents:", error);
      return [];
    }
  };

  // Fonction pour récupérer les devoirs en attente
  const fetchPendingAssignments = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/pending-assignments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Erreur devoirs en attente:", error);
      return [];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "cours", label: "Mes Cours", icon: "📚" },
    { id: "etudiants", label: "Étudiants", icon: "👨‍🎓" },
    { id: "notes", label: "Gérer les Notes", icon: "📝" },
    { id: "devoirs", label: "Créer un Devoirs", icon: "📋" },
    { id: "creer-cours", label: "Créer un Cours", icon: "➕" },
    { id: "profil", label: "Mon Profil", icon: "👤" }
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    switch(menuId) {
      case "dashboard":
        navigate("/dashboard-prof");
        break;
      case "cours":
        navigate("/mes-cours");
        break;
      case "etudiants":
     navigate("/etudiants");
        break;
      case "notes":
        navigate("/notes");
        break;
      case "devoirs":
        navigate("/creer_devoirs");
        break;
      case "creer-cours":
        navigate("/creer-cours");
        break;
      case "profil":
        navigate("/profil");
        break;
      default:
        break;
    }
  };

  if (!user) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontFamily: "Arial, sans-serif" 
      }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-prof-container">
      {/* Sidebar */}
      <div className="dashboard-prof-sidebar">
        <div className="dashboard-prof-sidebar-header">
          <h2 className="dashboard-prof-sidebar-title">Espace Professeur</h2>
          <p className="dashboard-prof-sidebar-subtitle">Prof. {user.nom}</p>
        </div>

        <nav className="dashboard-prof-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`dashboard-prof-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="dashboard-prof-logout-container">
          <button
            onClick={handleLogout}
            className="dashboard-prof-logout-btn"
          >
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-prof-main">
        {/* Header */}
        <header className="dashboard-prof-header">
          <h1 className="dashboard-prof-header-title">Tableau de Bord</h1>
          <p className="dashboard-prof-header-subtitle">
            Bonjour, Professeur {user.nom} 👨‍🏫
          </p>
        </header><br></br><br></br><br></br><br></br>

        {/* Stats Grid */}
        <div className="dashboard-prof-stats">
          <h2 className="dashboard-prof-stats-title">Aperçu du Semestre</h2>
          {loading ? (
            <div className="dashboard-prof-loading">
              <div className="dashboard-prof-spinner"></div>
              <p>Chargement des statistiques...</p>
            </div>
          ) : (
            <div className="dashboard-prof-stats-grid">
              <div className="dashboard-prof-stat-card">
                <div className="dashboard-prof-stat-icon">📚</div>
                <div className="dashboard-prof-stat-value">
                  {stats?.coursesCount || 0}
                </div>
                <div className="dashboard-prof-stat-label">Cours assignés</div>
              </div>

              <div className="dashboard-prof-stat-card">
                <div className="dashboard-prof-stat-icon">👨‍🎓</div>
                <div className="dashboard-prof-stat-value">
                  {stats?.studentsCount || 0}
                </div>
                <div className="dashboard-prof-stat-label">Étudiants</div>
              </div>

              <div className="dashboard-prof-stat-card">
                <div className="dashboard-prof-stat-icon">📝</div>
                <div className="dashboard-prof-stat-value">
                  {stats?.pendingAssignments || 0}
                </div>
                <div className="dashboard-prof-stat-label">Devoirs en attente</div>
              </div>

              <div className="dashboard-prof-stat-card">
                <div className="dashboard-prof-stat-icon">✅</div>
                <div className="dashboard-prof-stat-value">
                  {stats?.successRate || 0}%
                </div>
                <div className="dashboard-prof-stat-label">Taux de réussite</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-prof-actions">
          <h2 className="dashboard-prof-actions-title">Actions Rapides</h2>
          <div className="dashboard-prof-actions-grid">
            <button
              onClick={() => handleMenuClick("creer-cours")}
              className="dashboard-prof-action-btn courses"
            >
              ➕ Créer un Cours
            </button>
            <button
              onClick={() => handleMenuClick("devoirs")}
              className="dashboard-prof-action-btn assignments"
            >
              📋 Ajouter Devoir
            </button>
            <button
              onClick={() => handleMenuClick("notes")}
              className="dashboard-prof-action-btn notes"
            >
              📝 Saisir Notes
            </button>
            <button
              onClick={() => handleMenuClick("profil")}
              className="dashboard-prof-action-btn profile"
            >
              👤 Voir Profil
            </button>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="dashboard-prof-user-info">
          <h2 className="dashboard-prof-user-info-title">Informations Personnelles</h2>
          <div className="dashboard-prof-user-info-grid">
            <div>
              <strong>📧 Email:</strong> {user.email}
            </div>
            <div>
              <strong>👤 Rôle:</strong> {user.role}
            </div>
            <div>
              <strong>🆔 ID:</strong> {user.id}
            </div>
            {user.departement && (
              <div>
                <strong>🏫 Département:</strong> {user.departement}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProf;