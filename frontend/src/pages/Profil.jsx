import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/Profil.css';

const Profil = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("profil");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalCours: 0,
    totalClasses: 0
    // Supprimé: totalDevoirs: 0
  });

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "cours", label: "Mes Cours", icon: "📚" },
    { id: "etudiants", label: "Étudiants", icon: "👨‍🎓" },
    { id: "notes", label: "Gérer les Notes", icon: "📝" },
    { id: "devoirs", label: "Devoirs", icon: "📋" },
    { id: "creer-cours", label: "Créer un Cours", icon: "➕" },
    { id: "creer-classe", label: "Créer une Classe", icon: "🏫" },
    { id: "profil", label: "Mon Profil", icon: "👤" }
  ];

  // Récupérer les données du profil et statistiques
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }

        // Récupérer les statistiques
        if (token) {
          // Récupérer le nombre de cours
          const coursesResponse = await fetch('http://localhost:5000/api/courses/professeur', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (coursesResponse.ok) {
            const courses = await coursesResponse.json();
            setStatistics(prev => ({ ...prev, totalCours: courses.length }));
          }

          // Récupérer le nombre de classes
          const classesResponse = await fetch('http://localhost:5000/api/classes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (classesResponse.ok) {
            const classes = await classesResponse.json();
            setStatistics(prev => ({ ...prev, totalClasses: classes.length }));
          }

          // SUPPRIMÉ: La partie de récupération des devoirs
        }

      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    switch(menuId) {
      case "dashboard": navigate("/dashboard-prof"); break;
      case "cours": navigate("/mes-cours"); break;
      case "etudiants": navigate("/etudiants"); break;
      case "notes": navigate("/notes"); break;
      case "devoirs": navigate("/creer_devoirs"); break;
      case "creer-cours": navigate("/creer-cours"); break;
      case "creer-classe": navigate("/creer-classe"); break;
      case "profil": navigate("/profil"); break;
      default: break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  // ✅ FONCTION MODIFIER PROFIL - Rediriger vers la page de modification
  const handleEditProfile = () => {
    navigate('/modifier-profil');
  };

  // ✅ FONCTION CHANGER MOT DE PASSE - Rediriger vers la page de changement
  const handleChangePassword = () => {
    navigate('/changer-mot-de-passe');
  };

  const formatRole = (role) => {
    const roles = {
      'teacher': 'Enseignant',
      'professeur': 'Professeur',
      'admin': 'Administrateur'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div className="profil-container">
        {/* Sidebar */}
        <div className="profil-sidebar">
          <div className="profil-sidebar-header">
            <h2 className="profil-sidebar-title">Espace Professeur</h2>
            <p className="profil-sidebar-subtitle">Chargement...</p>
          </div>
        </div>
        
        <div className="profil-loading">
          <div className="profil-loading-content">
            <div className="profil-loading-icon">⏳</div>
            <div className="profil-loading-text">Chargement du profil...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-container">
      
      {/* Sidebar */}
      <div className="profil-sidebar">
        <div className="profil-sidebar-header">
          <h2 className="profil-sidebar-title">Espace Professeur</h2>
          <p className="profil-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="profil-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className={`profil-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="profil-logout-container">
          <button onClick={handleLogout} className="profil-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="profil-main">
        <header className="profil-header">
          <div className="profil-header-content">
            <div>
              <h1 className="profil-title">
                👤 Mon Profil
              </h1>
              <p className="profil-subtitle">
                Gérez vos informations personnelles et consultez vos statistiques
              </p>
            </div>
            <div className="profil-role-badge">
              {formatRole(user?.role)}
            </div>
          </div>
        </header>

        <div className="profil-grid">
          
          {/* Carte Informations Personnelles */}
          <div className="profil-card">
            <h2 className="profil-card-title">
              🏷️ Informations Personnelles
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="profil-info-item">
                <div className="profil-avatar">
                  {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="profil-info-label">Nom complet</div>
                  <div className="profil-info-value">
                    {user?.nom || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="profil-detail-item">
                <div className="profil-info-label">📧 Email</div>
                <div className="profil-info-value">
                  {user?.email || 'Non renseigné'}
                </div>
              </div>

              <div className="profil-detail-item role">
                <div className="profil-info-label">🎯 Rôle</div>
                <div className="profil-info-value">
                  {formatRole(user?.role)}
                </div>
              </div>

              <div className="profil-detail-item id">
                <div className="profil-info-label">🆔 Identifiant</div>
                <div className="profil-info-value">
                  #{user?.id || 'N/A'}
                </div>
              </div>
            </div>

            <div className="profil-buttons">
              <button 
                onClick={handleEditProfile}
                className="profil-btn edit"
              >
                ✏️ Modifier le profil
              </button>
              
              <button 
                onClick={handleChangePassword}
                className="profil-btn password"
              >
                🔒 Changer mot de passe
              </button>
            </div>
          </div>

          {/* Carte Statistiques */}
          <div className="profil-card">
            <h2 className="profil-card-title">
              📊 Mes Statistiques
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="profil-stat-card courses">
                <div className="profil-stat-icon">📚</div>
                <div className="profil-stat-label">Cours Créés</div>
                <div className="profil-stat-value">
                  {statistics.totalCours}
                </div>
              </div>

              <div className="profil-stat-card classes">
                <div className="profil-stat-icon">🏫</div>
                <div className="profil-stat-label">Classes Gérées</div>
                <div className="profil-stat-value">
                  {statistics.totalClasses}
                </div>
              </div>

              {/* SUPPRIMÉ: La carte des devoirs assignés */}
            </div>

            <div className="profil-activity">
              <h3 className="profil-activity-title">
                🎯 Résumé d'Activité
              </h3>
              <div className="profil-activity-text">
                Vous êtes un {formatRole(user?.role)} actif avec {statistics.totalCours} cours créés 
                et gérant {statistics.totalClasses} classes.
                {/* Supprimé la mention des devoirs */}
              </div>
            </div>
          </div>
        </div>

        {/* Section Actions Rapides */}
        <div className="profil-actions">
          <h2 className="profil-actions-title">
            ⚡ Actions Rapides
          </h2>
          
          <div className="profil-actions-grid">
            <button 
              onClick={() => navigate('/creer-cours')}
              className="profil-action-btn courses"
            >
              <span>➕</span>
              Nouveau Cours
            </button>

            <button 
              onClick={() => navigate('/creer-classe')}
              className="profil-action-btn classes"
            >
              <span>🏫</span>
              Nouvelle Classe
            </button>

            <button 
              onClick={() => navigate('/creer_devoirs')}
              className="profil-action-btn assignments"
            >
              <span>📝</span>
              Nouveau Devoir
            </button>

            <button 
              onClick={() => navigate('/mes-cours')}
              className="profil-action-btn view-courses"
            >
              <span>📚</span>
              Voir mes Cours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;