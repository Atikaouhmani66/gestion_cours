import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/Devoirs.css';

const Devoirs = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("devoirs");
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "cours", label: "Mes Cours", icon: "📚" },
    { id: "etudiants", label: "Étudiants", icon: "👨‍🎓" },
    { id: "notes", label: "Gérer les Notes", icon: "📝" },
    { id: "devoirs", label: "Devoirs", icon: "📋" },
    { id: "creer-cours", label: "Créer un Cours", icon: "➕" },
    { id: "creer-devoir", label: "Créer un Devoir", icon: "📝" },
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
        navigate("/devoirs");
        break;
      case "creer-cours":
        navigate("/creer-cours");
        break;
      case "creer-devoir":
        navigate("/creer-devoir");
        break;
      case "profil":
        navigate("/profil");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchDevoirs();
  }, []);

  const fetchDevoirs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/devoirs/professeur', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDevoirs(result.data.devoirs);
      } else {
        console.error('Erreur récupération devoirs:', result.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteDevoir = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/devoirs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('✅ Devoir supprimé avec succès');
        fetchDevoirs(); // Recharger la liste
      } else {
        alert(`❌ Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="devoirs-container">
      {/* Sidebar */}
      <div className="devoirs-sidebar">
        <div className="devoirs-sidebar-header">
          <h2 className="devoirs-sidebar-title">Espace Professeur</h2>
          <p className="devoirs-sidebar-subtitle">
            Prof. {user?.nom}
          </p>
        </div>

        <nav className="devoirs-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`devoirs-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="devoirs-logout-container">
          <button
            onClick={handleLogout}
            className="devoirs-logout-btn"
          >
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="devoirs-main">
        <header className="devoirs-header">
          <div>
            <h1 className="devoirs-header-title">Gestion des Devoirs</h1>
            <p className="devoirs-header-subtitle">
              Consultez et gérez tous vos devoirs
            </p>
          </div>
          <button
            onClick={() => navigate('/creer-devoir')}
            className="devoirs-new-btn"
          >
            <span>➕</span>
            Nouveau Devoir
          </button>
        </header>

        <div className="devoirs-content">
          {loading ? (
            <p>Chargement des devoirs...</p>
          ) : devoirs.length === 0 ? (
            <div className="devoirs-empty">
              <p className="devoirs-empty-text">Aucun devoir créé pour le moment</p>
              <button
                onClick={() => navigate('/creer-devoir')}
                className="devoirs-empty-btn"
              >
                Créer votre premier devoir
              </button>
            </div>
          ) : (
            <div className="devoirs-list">
              {devoirs.map(devoir => (
                <div key={devoir.id} className="devoirs-item">
                  <div className="devoirs-item-header">
                    <div className="devoirs-item-content">
                      <h3 className="devoirs-item-title">
                        {devoir.title}
                      </h3>
                      <p className="devoirs-item-detail">
                        <strong>Cours:</strong> {devoir.course_title}
                      </p>
                      <p className="devoirs-item-detail">
                        <strong>Classe:</strong> {devoir.class_name}
                      </p>
                      <p className="devoirs-item-detail">
                        <strong>Date limite:</strong> {new Date(devoir.date_limite).toLocaleDateString()}
                      </p>
                      {devoir.description && (
                        <p className="devoirs-item-description">
                          {devoir.description}
                        </p>
                      )}
                      {devoir.fichier && (
                        <p className="devoirs-item-file">
                          <strong>Fichier:</strong> {devoir.fichier}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDevoir(devoir.id)}
                      className="devoirs-delete-btn"
                    >
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

export default Devoirs;