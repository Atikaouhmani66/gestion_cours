import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/ModifierProfil.css';

const ModifierProfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        nom: parsedUser.nom || '',
        email: parsedUser.email || ''
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Ici vous devriez appeler une API pour mettre à jour le profil
      // Pour l'instant, on simule la mise à jour
      setTimeout(() => {
        // Mettre à jour les données locales
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert('✅ Profil modifié avec succès!');
        navigate('/profil');
      }, 1000);

    } catch (error) {
      alert('❌ Erreur lors de la modification du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleMenuClick = (menuId) => {
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

  return (
    <div className="modifier-profil-container">
      
      {/* Sidebar */}
      <div className="modifier-profil-sidebar">
        <div className="modifier-profil-sidebar-header">
          <h2 className="modifier-profil-sidebar-title">Espace Professeur</h2>
          <p className="modifier-profil-sidebar-subtitle">Modifier le profil</p>
        </div>
        
        <nav className="modifier-profil-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className="modifier-profil-menu-item"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="modifier-profil-logout-container">
          <button onClick={handleLogout} className="modifier-profil-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="modifier-profil-main">
        <header className="modifier-profil-header">
          <div className="modifier-profil-header-content">
            <div>
              <h1 className="modifier-profil-title">
                ✏️ Modifier mon Profil
              </h1>
              <p className="modifier-profil-subtitle">
                Mettez à jour vos informations personnelles
              </p>
            </div>
            <button 
              onClick={() => navigate('/profil')}
              className="modifier-profil-back-btn"
            >
              ← Retour
            </button>
          </div>
        </header><br></br><br></br><br></br><br></br>

        <div className="modifier-profil-form-container">
          
          <form onSubmit={handleSubmit}>
            <div className="modifier-profil-form">
              
              {/* Nom */}
              <div className="modifier-profil-form-group">
                <label className="modifier-profil-label">
                  👤 Nom complet *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="modifier-profil-input"
                  placeholder="Votre nom complet"
                />
              </div>

              {/* Email */}
              <div className="modifier-profil-form-group">
                <label className="modifier-profil-label">
                  📧 Adresse email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="modifier-profil-input"
                  placeholder="votre@email.com"
                />
              </div>

            </div>

            {/* Boutons */}
            <div className="modifier-profil-buttons">
              <button 
                type="submit" 
                disabled={loading}
                className="modifier-profil-submit-btn"
              >
                {loading ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/profil')}
                className="modifier-profil-cancel-btn"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModifierProfil;