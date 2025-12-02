import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './fichiersCSS/ModifierCours.css';

const ModifierCours = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    class_id: ''
  });
  const [error, setError] = useState(null);

  // Récupérer le cours à modifier
  useEffect(() => {
    const fetchCourseAndClasses = async () => {
      try {
        setPageLoading(true);
        const token = localStorage.getItem('token');
        
        // Récupérer le cours
        const courseResponse = await fetch(`http://localhost:5000/api/courses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (courseResponse.ok) {
          const result = await courseResponse.json();
          const course = result.data.course;
          setFormData({
            title: course.title,
            description: course.description || '',
            level: course.level,
            class_id: course.class_id.toString()
          });
        } else {
          setError('Cours non trouvé');
        }

        // Récupérer les classes
        const classesResponse = await fetch('http://localhost:5000/api/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur de chargement');
      } finally {
        setPageLoading(false);
      }
    };

    fetchCourseAndClasses();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          class_id: parseInt(formData.class_id)
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Cours modifié avec succès!');
        navigate('/mes-cours');
      } else {
        setError(result.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      setError('❌ Erreur de connexion au serveur');
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

  const user = JSON.parse(localStorage.getItem('user'));

  if (pageLoading) {
    return (
      <div className="modifier-cours-page-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#7f8c8d' }}>Chargement du cours...</div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="modifier-cours-error-state">
        <div className="modifier-cours-error-content">
          <div className="modifier-cours-error-icon">❌</div>
          <h2 className="modifier-cours-error-title">Erreur</h2>
          <p className="modifier-cours-error-text">{error}</p>
          <button 
            onClick={() => navigate('/mes-cours')}
            className="modifier-cours-error-btn"
          >
            ← Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modifier-cours-container">
      
      {/* Sidebar */}
      <div className="modifier-cours-sidebar">
        <div className="modifier-cours-sidebar-header">
          <h2 className="modifier-cours-sidebar-title">Espace Professeur</h2>
          <p className="modifier-cours-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="modifier-cours-nav">
          {menuItems.map(item => (
            <div key={item.id} onClick={() => handleMenuClick(item.id)}
              className="modifier-cours-menu-item"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="modifier-cours-logout-container">
          <button onClick={handleLogout} className="modifier-cours-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="modifier-cours-main">
        <header className="modifier-cours-header">
          <div className="modifier-cours-header-content">
            <div>
              <h1 className="modifier-cours-title">
                ✏️ Modifier le Cours
              </h1>
              <p className="modifier-cours-subtitle">
                Mettez à jour les informations de votre cours
              </p>
            </div>
            <button 
              onClick={() => navigate('/mes-cours')}
              className="modifier-cours-back-btn"
            >
              ← Retour
            </button>
          </div>
        </header><br></br><br></br><br></br>

        <div className="modifier-cours-form-container">
          
          {error && (
            <div className="modifier-cours-error">
              <strong>❌ Erreur:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="modifier-cours-form">
              
              {/* Titre */}
              <div className="modifier-cours-form-group">
                <label className="modifier-cours-label">
                  📝 Titre du Cours *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="modifier-cours-input"
                  placeholder="Ex: Mathématiques Avancées"
                />
              </div>

              {/* Description */}
              <div className="modifier-cours-form-group">
                <label className="modifier-cours-label">
                  📄 Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="modifier-cours-textarea"
                  placeholder="Décrivez le contenu de ce cours..."
                />
              </div>

              {/* Niveau */}
              <div className="modifier-cours-form-group">
                <label className="modifier-cours-label">
                  🎯 Niveau *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="modifier-cours-select"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>

              {/* Classe */}
              <div className="modifier-cours-form-group">
                <label className="modifier-cours-label">
                  🏫 Classe *
                </label>
                {classes.length === 0 ? (
                  <div className="modifier-cours-no-classes">
                    <strong>⚠️ Aucune classe disponible</strong><br/>
                    <span style={{ fontSize: '14px' }}>Créez d'abord une classe pour pouvoir modifier le cours.</span>
                  </div>
                ) : (
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                    className="modifier-cours-select"
                  >
                    <option value="">Sélectionnez une classe</option>
                    {classes.map(classe => (
                      <option key={classe.id} value={classe.id}>
                        {classe.name} {classe.niveau ? `- ${classe.niveau}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Boutons */}
            <div className="modifier-cours-buttons">
              <button 
                type="submit" 
                disabled={loading || classes.length === 0}
                className="modifier-cours-submit-btn"
              >
                {loading ? '⏳ Modification...' : '💾 Enregistrer les modifications'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/mes-cours')}
                className="modifier-cours-cancel-btn"
              >
                ❌ Annuler
              </button>
            </div>

            {/* Note informative */}
            <div className="modifier-cours-info">
              <strong>💡 Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModifierCours;