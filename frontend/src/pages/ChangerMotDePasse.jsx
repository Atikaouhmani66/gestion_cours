import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/ChangerMotDePasse.css';

const ChangerMotDePasse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Ici vous devriez appeler une API pour changer le mot de passe
      // Pour l'instant, on simule le changement
      setTimeout(() => {
        alert('✅ Mot de passe changé avec succès!');
        navigate('/profil');
      }, 1000);

    } catch (error) {
      setError('❌ Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
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
    <div className="changer-mdp-container">
      
      {/* Sidebar */}
      <div className="changer-mdp-sidebar">
        <div className="changer-mdp-sidebar-header">
          <h2 className="changer-mdp-sidebar-title">Espace Professeur</h2>
          <p className="changer-mdp-sidebar-subtitle">Changer mot de passe</p>
        </div>
        
        <nav className="changer-mdp-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className="changer-mdp-menu-item"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="changer-mdp-logout-container">
          <button onClick={handleLogout} className="changer-mdp-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="changer-mdp-main">
        <header className="changer-mdp-header">
          <div className="changer-mdp-header-content">
            <div>
              <h1 className="changer-mdp-title">
                🔒 Changer mon Mot de Passe
              </h1>
              <p className="changer-mdp-subtitle">
                Mettez à jour votre mot de passe pour renforcer la sécurité
              </p>
            </div>
            <button 
              onClick={() => navigate('/profil')}
              className="changer-mdp-back-btn"
            >
              ← Retour
            </button>
          </div>
        </header><br></br><br></br><br></br><br></br>

        <div className="changer-mdp-form-container">
          
          {error && (
            <div className="changer-mdp-error">
              <strong>❌ Erreur:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="changer-mdp-form">
              
              {/* Mot de passe actuel */}
              <div className="changer-mdp-form-group">
                <label className="changer-mdp-label">
                  🔑 Mot de passe actuel *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="changer-mdp-input"
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              {/* Nouveau mot de passe */}
              <div className="changer-mdp-form-group">
                <label className="changer-mdp-label">
                  🆕 Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="changer-mdp-input"
                  placeholder="Au moins 6 caractères"
                />
              </div>

              {/* Confirmation */}
              <div className="changer-mdp-form-group">
                <label className="changer-mdp-label">
                  ✅ Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="changer-mdp-input"
                  placeholder="Retapez le nouveau mot de passe"
                />
              </div>

            </div>

            {/* Conseils de sécurité */}
            <div className="changer-mdp-security-tips">
              <strong>💡 Conseils de sécurité :</strong>
              <ul className="changer-mdp-tips-list">
                <li>Utilisez au moins 6 caractères</li>
                <li>Combinez lettres, chiffres et caractères spéciaux</li>
                <li>Évitez les mots de passe facilement devinables</li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="changer-mdp-buttons-container">
              <button 
                type="submit" 
                disabled={loading}
                className="changer-mdp-submit-btn"
              >
                {loading ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/profil')}
                className="changer-mdp-cancel-btn"
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

export default ChangerMotDePasse;