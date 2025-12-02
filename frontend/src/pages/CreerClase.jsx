import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/CreerClasse.css';

const CreerClasse = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("creer-classe");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',          // On garde 'name' 
    niveau: '',
    annee_scolaire: '2023-2024'
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        alert('❌ Vous devez être connecté pour créer une classe');
        navigate('/login');
        return;
      }

      console.log('🔄 Données du formulaire:', formData);

      // Validation côté client
      if (!formData.name || formData.name.trim() === '') {
        alert('❌ Le nom de la classe est obligatoire');
        setLoading(false);
        return;
      }

      if (!formData.niveau || formData.niveau === '') {
        alert('❌ Le niveau est obligatoire');
        setLoading(false);
        return;
      }

      // Maintenant on envoie 'name' et le backend l'attend aussi
      const dataToSend = {
        name: formData.name.trim(),
        niveau: formData.niveau,
        annee_scolaire: formData.annee_scolaire
      };

      console.log('📤 Données envoyées au serveur:', dataToSend);

      const response = await fetch('http://localhost:5000/api/classes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('📥 Statut HTTP:', response.status);
      
      const result = await response.json();
      console.log('📥 Réponse complète du serveur:', result);

      if (response.ok) {
        if (result.success) {
          alert('✅ Classe créée avec succès!');
          setFormData({
            name: '',
            niveau: '',
            annee_scolaire: '2023-2024'
          });
          navigate('/creer-cours');
        } else {
          alert(`❌ ${result.message || 'Erreur lors de la création'}`);
        }
      } else {
        if (response.status === 400) {
          alert(`❌ Erreur de validation: ${result.message}`);
        } else if (response.status === 500) {
          alert(`❌ Erreur serveur: ${result.message}`);
        } else {
          alert(`❌ Erreur ${response.status}: ${result.message || 'Erreur inconnue'}`);
        }
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      alert('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="creer-classe-container">
      {/* Sidebar */}
      <div className="creer-classe-sidebar">
        <div className="creer-classe-sidebar-header">
          <h2 className="creer-classe-sidebar-title">Espace Professeur</h2>
          <p className="creer-classe-sidebar-subtitle">
            Prof. {user?.nom}
          </p>
        </div>

        <nav className="creer-classe-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`creer-classe-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="creer-classe-logout-container">
          <button
            onClick={handleLogout}
            className="creer-classe-logout-btn"
          >
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="creer-classe-main">
        <header className="creer-classe-header">
          <h1 className="creer-classe-header-title">Créer une Nouvelle Classe</h1>
          <p className="creer-classe-header-subtitle">
            Remplissez les informations pour créer une nouvelle classe
          </p>
        </header><br></br><br></br><br></br>

        <div className="creer-classe-form-container">
          <form onSubmit={handleSubmit}>
            <div className="creer-classe-form">
              
              {/* Nom de la classe - On garde 'name' */}
              <div className="creer-classe-form-group">
                <label className="creer-classe-label">
                  Nom de la Classe *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="creer-classe-input"
                  placeholder="Ex: Classe A, Terminale S, Groupe 1..."
                />
                <small className="creer-classe-help-text">
                  {formData.name ? `✅ Nom saisi: "${formData.name}"` : "⚠️ Ce champ est obligatoire"}
                </small>
              </div>

              {/* Niveau */}
              <div className="creer-classe-form-group">
                <label className="creer-classe-label">
                  Niveau *
                </label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  required
                  className="creer-classe-select"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="primaire">Primaire</option>
                  <option value="college">Collège</option>
                  <option value="lycee">Lycée</option>
                  <option value="universite">Université</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
                <small className="creer-classe-help-text">
                  {formData.niveau ? `✅ Niveau sélectionné: "${formData.niveau}"` : "⚠️ Ce champ est obligatoire"}
                </small>
              </div>

              {/* Année Scolaire */}
              <div className="creer-classe-form-group">
                <label className="creer-classe-label">
                  Année Scolaire
                </label>
                <select
                  name="annee_scolaire"
                  value={formData.annee_scolaire}
                  onChange={handleInputChange}
                  className="creer-classe-select"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2022-2023">2022-2023</option>
                </select>
              </div>

            </div>

            {/* Boutons */}
            <div className="creer-classe-buttons">
              <button
                type="submit"
                disabled={loading}
                className="creer-classe-submit-btn"
              >
                {loading ? "⏳ Création en cours..." : "🏫 Créer la Classe"}
              </button>

              <button
                type="button"
                onClick={() => navigate('/creer-cours')}
                className="creer-classe-back-btn"
              >
                ↩️ Retour aux Cours
              </button>
            </div>

            {/* Debug info */}
            <div className="creer-classe-debug">
              <strong>Debug Info:</strong>
              <br />
              Name: "{formData.name}" | Niveau: "{formData.niveau}"
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerClasse;