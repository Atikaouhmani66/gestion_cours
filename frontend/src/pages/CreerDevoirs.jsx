import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/CreerDevoirs.css';

const CreerDevoirs = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("devoirs");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    class_id: '',
    date_limite: '',
    fichier: null
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

  // Récupérer les cours et classes depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Récupérer les cours
        const coursesResponse = await fetch('http://localhost:5000/api/courses/professeur', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
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
        console.error('Erreur chargement données:', error);
      }
    };

    fetchData();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, fichier: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        alert('❌ Vous devez être connecté');
        navigate('/login');
        return;
      }

      // Validation
      if (!formData.title.trim()) { 
        alert('❌ Le titre est obligatoire'); 
        setLoading(false); 
        return; 
      }
      if (!formData.course_id) { 
        alert('❌ Le cours est obligatoire'); 
        setLoading(false); 
        return; 
      }
      if (!formData.class_id) { 
        alert('❌ La classe est obligatoire'); 
        setLoading(false); 
        return; 
      }
      if (!formData.date_limite) { 
        alert('❌ La date limite est obligatoire'); 
        setLoading(false); 
        return; 
      }

      // Validation de la date limite
      const dateLimite = new Date(formData.date_limite);
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
          
      if (dateLimite <= aujourdhui) {
        alert('❌ La date limite doit être ultérieure à aujourd\'hui');
        setLoading(false);
        return;
      }

      // Création FormData pour l'envoi du fichier
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('course_id', formData.course_id);
      formDataToSend.append('class_id', formData.class_id);
      formDataToSend.append('date_limite', formData.date_limite);
      
      if (formData.fichier) {
        formDataToSend.append('fichier', formData.fichier);
      }

      const response = await fetch('http://localhost:5000/api/devoirs/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.status === 401) handleLogout();
      else if (response.ok && result.success) {
        alert('✅ Devoir créé avec succès!' + (formData.fichier ? ' avec fichier' : ''));
        setFormData({ 
          title: '', 
          description: '', 
          course_id: '', 
          class_id: '', 
          date_limite: '',
          fichier: null 
        });
        // Reset le champ fichier dans le DOM
        document.getElementById('fichier-input').value = '';
        navigate('/mes-devoirs');
      } else {
        alert(`❌ Erreur: ${result.message || 'Erreur de création'}`);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erreur de connexion au serveur');
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem('user'));

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="creer-devoirs-container">
      
      {/* Sidebar */}
      <div className="creer-devoirs-sidebar">
        <div className="creer-devoirs-sidebar-header">
          <h2 className="creer-devoirs-sidebar-title">Espace Professeur</h2>
          <p className="creer-devoirs-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="creer-devoirs-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className={`creer-devoirs-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="creer-devoirs-logout-container">
          <button onClick={handleLogout} className="creer-devoirs-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="creer-devoirs-main">
        <header className="creer-devoirs-header">
          <div className="creer-devoirs-header-content">
            <div>
              <h1 className="creer-devoirs-title">
                📋 Créer un Devoir
              </h1>
              <p className="creer-devoirs-subtitle">
                Assignez un nouveau devoir à vos étudiants
              </p>
            </div>
            <button 
              onClick={() => navigate('/mes-devoirs')}
              className="creer-devoirs-header-btn"
            >
              📚 Mes Devoirs
            </button>
          </div>
        </header><br></br><br></br><br></br>

        <div className="creer-devoirs-form-container">
          
          <form onSubmit={handleSubmit}>
            <div className="creer-devoirs-form">
              
              {/* Titre */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  📝 Titre du Devoir *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="creer-devoirs-input"
                  placeholder="Ex: Devoir de Mathématiques - Chapitre 1"
                />
              </div>

              {/* Description */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  📄 Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="creer-devoirs-textarea"
                  placeholder="Décrivez les consignes du devoir, les exercices à faire, les ressources disponibles..."
                />
              </div>

              {/* Fichier */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  📎 Fichier du Devoir (Optionnel)
                </label>
                <input
                  id="fichier-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                  className="creer-devoirs-file-input"
                />
                <p className="creer-devoirs-file-help">
                  Formats acceptés: PDF, Word, PowerPoint, images, ZIP (max 10MB)
                </p>
                {formData.fichier && (
                  <p className="creer-devoirs-file-selected">
                    ✅ Fichier sélectionné: {formData.fichier.name}
                  </p>
                )}
              </div>

              {/* Cours */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  📚 Cours Associé *
                </label>
                {courses.length === 0 ? (
                  <div className="creer-devoirs-no-data">
                    <strong>⚠️ Aucun cours disponible</strong>
                    <span>Créez d'abord un cours pour pouvoir assigner un devoir.</span>
                  </div>
                ) : (
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                    className="creer-devoirs-select"
                  >
                    <option value="">Sélectionnez un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} - {course.class_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Classe */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  🏫 Classe Destinataire *
                </label>
                {classes.length === 0 ? (
                  <div className="creer-devoirs-no-data">
                    <strong>⚠️ Aucune classe disponible</strong>
                    <span>Créez d'abord une classe pour pouvoir assigner un devoir.</span>
                  </div>
                ) : (
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                    className="creer-devoirs-select"
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

              {/* Date limite */}
              <div className="creer-devoirs-form-group">
                <label className="creer-devoirs-label">
                  ⏰ Date Limite de Rendu *
                </label>
                <input
                  type="date"
                  name="date_limite"
                  value={formData.date_limite}
                  onChange={handleInputChange}
                  required
                  min={today}
                  className="creer-devoirs-input"
                />
                <p className="creer-devoirs-file-help">
                  La date limite doit être ultérieure à aujourd'hui
                </p>
              </div>

            </div>

            {/* Boutons */}
            <div className="creer-devoirs-buttons">
              <button 
                type="submit" 
                disabled={loading || courses.length === 0 || classes.length === 0}
                className="creer-devoirs-submit-btn"
              >
                {loading ? '⏳ Création...' : '📋 Créer le Devoir'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/mes-devoirs')}
                className="creer-devoirs-secondary-btn"
              >
                📚 Voir mes Devoirs
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/dashboard-prof')}
                className="creer-devoirs-tertiary-btn"
              >
                🏠 Tableau de Bord
              </button>
            </div>

            {/* Note informative */}
            <div className="creer-devoirs-info">
              <strong>💡 Information :</strong> Les champs marqués d'un astérisque (*) sont obligatoires. 
              Le devoir sera visible par les étudiants de la classe sélectionnée jusqu'à la date limite.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerDevoirs;