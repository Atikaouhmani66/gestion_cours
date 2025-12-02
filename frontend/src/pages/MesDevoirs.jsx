import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/MesDevoirs.css';

const MesDevoirs = () => {
  const navigate = useNavigate();
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("devoirs");

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

  useEffect(() => {
    fetchDevoirs();
  }, []);

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    console.log('Menu cliqué:', menuId);
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
        console.log('Déjà sur la page devoirs');
        break;
      case "creer-cours": 
        navigate("/creer-cours"); 
        break;
      case "creer-classe": 
        navigate("/creer-classe"); 
        break;
      case "profil": 
        navigate("/profil"); 
        break;
      default: 
        break;
    }
  };

  const fetchDevoirs = async () => {
    try {
      console.log('🔍 Récupération des devoirs...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Token manquant');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/devoirs/professeur', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Statut réponse:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Devoirs récupérés:', result.devoirs?.length || 0);
        setDevoirs(result.devoirs || []);
      } else if (response.status === 401) {
        console.error('❌ Token invalide ou expiré');
        handleLogout();
      } else {
        console.error('❌ Erreur serveur:', response.status);
      }
    } catch (error) {
      console.error('💥 Erreur fetchDevoirs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevoir = async (devoirId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/devoirs/${devoirId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Devoir supprimé avec succès');
        fetchDevoirs();
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleDownloadFile = (devoirId, fileName) => {
    const token = localStorage.getItem('token');
    const downloadUrl = `http://localhost:5000/api/devoirs/${devoirId}/file`;
    
    console.log('📥 Téléchargement fichier:', fileName);
    window.open(downloadUrl, '_blank');
  };

  const handleViewDevoir = (devoirId) => {
    console.log('👁️ Voir devoir:', devoirId);
    alert('Fonctionnalité "Voir" à implémenter');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (dateLimite) => {
    const today = new Date();
    const limite = new Date(dateLimite);
    return limite < today ? '#e74c3c' : '#27ae60';
  };

  const getStatusText = (dateLimite) => {
    const today = new Date();
    const limite = new Date(dateLimite);
    return limite < today ? '⏰ En retard' : '✅ En cours';
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem('user'));

  if (loading) return (
    <div className="mes-devoirs-container">
      {/* Sidebar */}
      <div className="mes-devoirs-sidebar">
        <div className="mes-devoirs-sidebar-header">
          <h2 className="mes-devoirs-sidebar-title">Espace Professeur</h2>
          <p className="mes-devoirs-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="mes-devoirs-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className={`mes-devoirs-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="mes-devoirs-loading">
        <div className="mes-devoirs-loading-content">
          <div className="mes-devoirs-loading-icon">⏳</div>
          <h3 className="mes-devoirs-loading-text">Chargement des devoirs...</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mes-devoirs-container">
      
      {/* Sidebar */}
      <div className="mes-devoirs-sidebar">
        <div className="mes-devoirs-sidebar-header">
          <h2 className="mes-devoirs-sidebar-title">Espace Professeur</h2>
          <p className="mes-devoirs-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="mes-devoirs-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className={`mes-devoirs-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="mes-devoirs-logout-container">
          <button onClick={handleLogout} className="mes-devoirs-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mes-devoirs-main">
        <header className="mes-devoirs-header">
          <div className="mes-devoirs-header-content">
            <div>
              <h1 className="mes-devoirs-title">
                📚 Mes Devoirs
              </h1>
              <p className="mes-devoirs-subtitle">
                Gérer et consulter tous vos devoirs assignés
              </p>
            </div>
            <button 
              onClick={() => navigate('/creer_devoirs')}
              className="mes-devoirs-new-btn"
            >
              ➕ Nouveau Devoir
            </button>
          </div>
        </header>

        {devoirs.length === 0 ? (
          <div className="mes-devoirs-empty">
            <div className="mes-devoirs-empty-icon">📝</div>
            <h3 className="mes-devoirs-empty-title">Aucun devoir créé pour le moment</h3>
            <p className="mes-devoirs-empty-text">
              Commencez par créer votre premier devoir pour vos étudiants
            </p>
            <button 
              onClick={() => navigate('/creer_devoirs')}
              className="mes-devoirs-empty-btn"
            >
              Créer votre premier devoir
            </button>
          </div>
        ) : (
          <div className="mes-devoirs-list">
            {devoirs.map(devoir => (
              <div key={devoir.id} className="mes-devoirs-item" style={{ borderLeftColor: getStatusColor(devoir.date_limite) }}>
                <div className="mes-devoirs-item-content">
                  <div className="mes-devoirs-item-main">
                    <div className="mes-devoirs-item-header">
                      <h3 className="mes-devoirs-item-title">
                        {devoir.title}
                      </h3>
                      <span className={`mes-devoirs-status ${getStatusColor(devoir.date_limite) === '#e74c3c' ? 'late' : ''}`}>
                        {getStatusText(devoir.date_limite)}
                      </span>
                    </div>
                    
                    {devoir.description && (
                      <p className="mes-devoirs-item-description">
                        {devoir.description}
                      </p>
                    )}

                    <div className="mes-devoirs-item-details">
                      <span className="mes-devoirs-detail-item">
                        📚 <strong>{devoir.course_title}</strong>
                      </span>
                      <span className="mes-devoirs-detail-item">
                        🏫 <strong>{devoir.class_name}</strong>
                      </span>
                      <span className={`mes-devoirs-detail-item ${getStatusColor(devoir.date_limite) === '#e74c3c' ? 'late' : ''}`}>
                        ⏰ <strong>Limite: {formatDate(devoir.date_limite)}</strong>
                      </span>
                      
                      {devoir.fichier && (
                        <span className="mes-devoirs-detail-item file">
                          📎 <strong>Fichier joint</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Boutons - Seulement le bouton Télécharger pour les devoirs avec fichier */}
                  <div className="mes-devoirs-actions">
                    {devoir.fichier && (
                      <button 
                        onClick={() => handleDownloadFile(devoir.id, devoir.fichier)}
                        className="mes-devoirs-action-btn download"
                      >
                        📎 Télécharger
                      </button>
                    )}
                    
                    {/* Les boutons "Voir" et "Supprimer" sont retirés pour les devoirs avec fichiers */}
                    {!devoir.fichier && (
                      <>
                        <button 
                          onClick={() => handleViewDevoir(devoir.id)}
                          className="mes-devoirs-action-btn view"
                        >
                          👁️ Voir
                        </button>
                        <button 
                          onClick={() => handleDeleteDevoir(devoir.id)}
                          className="mes-devoirs-action-btn delete"
                        >
                          🗑️ Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section fichier détaillée */}
                {devoir.fichier && (
                  <div className="mes-devoirs-file-section">
                    <div className="mes-devoirs-file-content">
                      <span className="mes-devoirs-file-icon">📎</span>
                      <div className="mes-devoirs-file-info">
                        <div className="mes-devoirs-file-name">
                          Fichier attaché: {devoir.fichier}
                        </div>
                        <button 
                          onClick={() => handleDownloadFile(devoir.id, devoir.fichier)}
                          className="mes-devoirs-file-download"
                        >
                          Télécharger le fichier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesDevoirs;