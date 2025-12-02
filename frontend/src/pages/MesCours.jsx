import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/MesCours.css';

const MesCours = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("cours");
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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

  // ✅ FONCTION POUR RÉCUPÉRER LES COURS
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        setError('❌ Token manquant - Veuillez vous reconnecter');
        navigate('/login');
        return;
      }

      console.log('🔄 Début fetch courses...');

      const response = await fetch('http://localhost:5000/api/courses/professeur', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Statut réponse:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('❌ Session expirée - Veuillez vous reconnecter');
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Cours reçus:', result);

      setCours(result);

    } catch (error) {
      console.error('💥 Erreur fetch courses:', error);
      setError(`❌ Erreur de chargement: ${error.message}`);
      setCours([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FONCTION POUR TÉLÉCHARGER UN FICHIER
  const handleDownloadFile = async (courseId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📥 Tentative de téléchargement pour le cours:', courseId);
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Créer un blob et télécharger le fichier
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || 'cours-fichier';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Fichier téléchargé avec succès');
      } else {
        const errorData = await response.json();
        alert(`❌ Erreur: ${errorData.message || 'Impossible de télécharger le fichier'}`);
      }
    } catch (error) {
      console.error('💥 Erreur téléchargement:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  // ✅ FONCTION VOIR - Rediriger vers la page de détail
  const handleViewCourse = (courseId) => {
    console.log('👁️ Voir cours:', courseId);
    navigate(`/voir-cours/${courseId}`);
  };

  // ✅ FONCTION MODIFIER - Rediriger vers la page de modification
  const handleEditCourse = (courseId) => {
    console.log('✏️ Modifier cours:', courseId);
    navigate(`/modifier-cours/${courseId}`);
  };

  // ✅ FONCTION SUPPRIMER
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le cours "${courseTitle}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🗑️ Suppression en cours...');

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Cours supprimé avec succès!');
        // Recharger la liste des cours
        fetchCourses();
      } else {
        alert(`❌ Erreur: ${result.message || 'Erreur de suppression'}`);
      }
    } catch (error) {
      console.error('💥 Erreur suppression:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  // ✅ INITIALISATION
  useEffect(() => {
    console.log('🎯 Composant MesCours monté');
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('👤 Utilisateur chargé:', parsedUser);
      } catch (e) {
        console.error('❌ Erreur parsing user:', e);
      }
    }

    fetchCourses();
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

  // ✅ BOUTON POUR RECHARGER
  const handleRetry = () => {
    fetchCourses();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ✅ FONCTION POUR OBTENIR L'ICÔNE DU FICHIER
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📕';
      case 'doc': case 'docx': return '📘';
      case 'ppt': case 'pptx': return '📙';
      case 'jpg': case 'jpeg': case 'png': return '🖼️';
      case 'zip': case 'rar': return '📦';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="mes-cours-container">
        {/* Sidebar */}
        <div className="mes-cours-sidebar">
          <div className="mes-cours-sidebar-header">
            <h2 className="mes-cours-sidebar-title">Espace Professeur</h2>
            <p className="mes-cours-sidebar-subtitle">Chargement...</p>
          </div>
        </div>
        <div className="mes-cours-loading">
          <div className="mes-cours-loading-content">
            <div className="mes-cours-loading-icon">⏳</div>
            <div className="mes-cours-loading-text">Chargement des cours...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mes-cours-container">
      
      {/* Sidebar */}
      <div className="mes-cours-sidebar">
        <div className="mes-cours-sidebar-header">
          <h2 className="mes-cours-sidebar-title">Espace Professeur</h2>
          <p className="mes-cours-sidebar-subtitle">Prof. {user?.nom || 'Utilisateur'}</p>
        </div>
        <nav className="mes-cours-nav">
          {menuItems.map(item => (
            <div key={item.id} onClick={() => handleMenuClick(item.id)}
              className={`mes-cours-menu-item ${activeMenu === item.id ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="mes-cours-logout-container">
          <button onClick={handleLogout} className="mes-cours-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mes-cours-main">
        <header className="mes-cours-header">
          <div className="mes-cours-header-content">
            <div>
              <h1 className="mes-cours-header-title">Mes Cours</h1>
              <p className="mes-cours-header-subtitle">
                {cours.length} cours créés
              </p>
            </div>
            <div className="mes-cours-header-buttons">
              <button 
                onClick={handleRetry}
                className="mes-cours-refresh-btn"
              >
                <span>🔄</span>
                Actualiser
              </button>
              <button 
                onClick={() => navigate('/creer-cours')}
                className="mes-cours-new-btn"
              >
                <span>➕</span>
                Nouveau Cours
              </button>
            </div>
          </div>
        </header><br></br><br></br><br></br>

        <div className="mes-cours-content">
          
          {/* Affichage des erreurs */}
          {error && (
            <div className="mes-cours-error">
              <strong>Erreur:</strong> {error}
              <button 
                onClick={handleRetry}
                className="mes-cours-error-btn"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Debug info */}
          <div className="mes-cours-debug">
            <strong>Debug Info:</strong><br />
            Statut: {loading ? 'Chargement...' : 'Terminé'}<br />
            Erreur: {error || 'Aucune'}<br />
            Cours chargés: {cours.length}<br />
            User: {user ? user.nom : 'Non connecté'}<br />
          </div>

          {cours.length === 0 ? (
            <div className="mes-cours-empty">
              <div className="mes-cours-empty-icon">📚</div>
              <h3 className="mes-cours-empty-title">Aucun cours créé</h3>
              <p>Commencez par créer votre premier cours</p>
              <button 
                onClick={() => navigate('/creer-cours')}
                className="mes-cours-empty-btn"
              >
                Créer mon premier cours
              </button>
            </div>
          ) : (
            <div className="mes-cours-list">
              {cours.map(coursItem => (
                <div key={coursItem.id} className="mes-cours-item">
                  <div className="mes-cours-item-header">
                    <h3 className="mes-cours-item-title">
                      {coursItem.title}
                    </h3>
                    <span className="mes-cours-item-level">
                      {coursItem.level}
                    </span>
                  </div>
                  
                  {coursItem.description && (
                    <p className="mes-cours-item-description">
                      {coursItem.description}
                    </p>
                  )}

                  {/* ✅ SECTION FICHIER */}
                  {coursItem.fichier && (
                    <div className="mes-cours-file">
                      <div className="mes-cours-file-content">
                        <span className="mes-cours-file-icon">
                          {getFileIcon(coursItem.fichier)}
                        </span>
                        <div className="mes-cours-file-info">
                          <strong>Fichier attaché:</strong><br />
                          <span className="mes-cours-file-name">
                            {coursItem.fichier}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDownloadFile(coursItem.id, coursItem.fichier)}
                          className="mes-cours-download-btn"
                        >
                          <span>⬇️</span>
                          Télécharger
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mes-cours-details">
                    <div>
                      <strong>Classe:</strong> {coursItem.class_name || 'Non assigné'}
                    </div>
                    <div>
                      <strong>Créé le:</strong> {formatDate(coursItem.created_at)}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="mes-cours-actions">
                    <button 
                      onClick={() => handleViewCourse(coursItem.id)}
                      className="mes-cours-action-btn view"
                    >
                      <span>👁️</span>
                      Voir
                    </button>
                    <button 
                      onClick={() => handleEditCourse(coursItem.id)}
                      className="mes-cours-action-btn edit"
                    >
                      <span>✏️</span>
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(coursItem.id, coursItem.title)}
                      className="mes-cours-action-btn delete"
                    >
                      <span>🗑️</span>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesCours;