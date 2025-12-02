import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/CreerCours.css';

const CreerCours = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("creer-cours");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    level: '',
    class_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

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

  // Récupérer les classes depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔄 Début fetch classes...');
        
        const response = await fetch('http://localhost:5000/api/classes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Statut réponse:', response.status);
        console.log('📡 URL appelée:', 'http://localhost:5000/api/classes');

        if (response.ok) {
          const classesData = await response.json();
          console.log('✅ Classes reçues:', classesData);
          setClasses(classesData);
        } else {
          console.error('❌ Erreur fetch classes - Statut:', response.status);
          await fetchClassesFallback();
        }
      } catch (error) {
        console.error('💥 Erreur fetch classes:', error);
        await fetchClassesFallback();
      } finally {
        setClassesLoading(false);
      }
    };

    const fetchClassesFallback = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/classes/professeur', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Classes reçues (fallback):', data);
          setClasses(data.data?.classes || data.classes || []);
        }
      } catch (fallbackError) {
        console.error('💥 Erreur fallback:', fallbackError);
      }
    };

    fetchClasses();
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

  // ✅ FONCTION POUR GÉRER LA SÉLECTION DE FICHIER
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Vérifier la taille du fichier (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('Le fichier est trop volumineux (max 10MB)');
        setSelectedFile(null);
        e.target.value = ''; // Reset le champ
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'application/zip'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setFileError('Type de fichier non autorisé');
        setSelectedFile(null);
        e.target.value = ''; // Reset le champ
        return;
      }

      setSelectedFile(file);
      console.log('📄 Fichier sélectionné:', file.name, 'Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    } else {
      setSelectedFile(null);
    }
  };

  // ✅ FONCTION POUR SUPPRIMER LE FICHIER SÉLECTIONNÉ
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    // Reset le champ fichier
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // ✅ FONCTION DE SOUMISSION CORRIGÉE POUR LES FICHIERS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFileError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        alert('❌ Vous devez être connecté');
        navigate('/login');
        return;
      }

      // Validation des champs obligatoires
      if (!formData.titre.trim()) { 
        alert('❌ Le titre est obligatoire'); 
        setLoading(false); 
        return; 
      }
      if (!formData.level) { 
        alert('❌ Le niveau est obligatoire'); 
        setLoading(false); 
        return; 
      }
      if (!formData.class_id) { 
        alert('❌ La classe est obligatoire'); 
        setLoading(false); 
        return; 
      }

      // ✅ CRÉATION DE FORMDATA POUR L'UPLOAD DE FICHIER
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.titre.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('level', formData.level);
      formDataToSend.append('class_id', formData.class_id);
      
      // Ajouter le fichier s'il est sélectionné
      if (selectedFile) {
        formDataToSend.append('fichier', selectedFile);
      }

      console.log('📤 Envoi des données avec fichier:', selectedFile ? 'OUI' : 'NON');

      const response = await fetch('http://localhost:5000/api/courses/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NE PAS mettre Content-Type pour FormData (le navigateur le fera automatiquement)
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.status === 401) {
        handleLogout();
      } else if (response.ok && result.success) {
        alert('✅ Cours créé avec succès!' + (selectedFile ? ' Fichier uploadé.' : ''));
        // Reset du formulaire
        setFormData({ titre: '', description: '', level: '', class_id: '' });
        setSelectedFile(null);
        setFileError('');
        // Reset le champ fichier
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
        navigate('/mes-cours');
      } else {
        alert(`❌ Erreur: ${result.message || 'Erreur de création'}`);
      }
    } catch (error) {
      console.error('💥 Erreur création cours:', error);
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

  return (
    <div className="creer-cours-container">
      
      {/* Sidebar */}
      <div className="creer-cours-sidebar">
        <div className="creer-cours-sidebar-header">
          <h2 className="creer-cours-sidebar-title">Espace Professeur</h2>
          <p className="creer-cours-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        <nav className="creer-cours-nav">
          {menuItems.map(item => (
            <div key={item.id} onClick={() => handleMenuClick(item.id)}
              className={`creer-cours-menu-item ${activeMenu === item.id ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="creer-cours-logout-container">
          <button onClick={handleLogout} className="creer-cours-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="creer-cours-main">
        <header className="creer-cours-header">
          <h1 className="creer-cours-header-title">Créer un Nouveau Cours</h1>
          <p className="creer-cours-header-subtitle">
            Remplissez les informations pour créer un nouveau cours
          </p>
        </header><br></br><br></br><br></br>

        <div className="creer-cours-form-container">
          <form onSubmit={handleSubmit}>
            <div className="creer-cours-form">
              
              {/* Titre */}
              <div className="creer-cours-form-group">
                <label className="creer-cours-label">Titre du Cours *</label>
                <input 
                  type="text" 
                  name="titre" 
                  value={formData.titre} 
                  onChange={handleInputChange} 
                  required
                  className="creer-cours-input"
                  placeholder="Ex: Mathématiques Avancées" 
                />
              </div>

              {/* Description */}
              <div className="creer-cours-form-group">
                <label className="creer-cours-label">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows="4"
                  className="creer-cours-textarea"
                  placeholder="Décrivez le contenu de ce cours..." 
                />
              </div>

              {/* ✅ CHAMP FICHIER */}
              <div className="creer-cours-form-group">
                <label className="creer-cours-label">
                  Fichier du Cours (Optionnel)
                </label>
                <input 
                  type="file" 
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip"
                  className={`creer-cours-file-input ${fileError ? 'error' : ''}`}
                />
                
                {/* Affichage du fichier sélectionné */}
                {selectedFile && (
                  <div className="creer-cours-file-selected">
                    <div className="creer-cours-file-info">
                      <span className="creer-cours-file-name">✅ Fichier sélectionné:</span>
                      <span className="creer-cours-file-name">{selectedFile.name}</span>
                      <span className="creer-cours-file-size">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="creer-cours-remove-file"
                    >
                      ✕ Supprimer
                    </button>
                  </div>
                )}

                {/* Message d'erreur */}
                {fileError && (
                  <div className="creer-cours-file-error">
                    ❌ {fileError}
                  </div>
                )}

                <p className="creer-cours-file-help">
                  Types autorisés: PDF, Word, PowerPoint, images, texte, ZIP (max 10MB)
                </p>
              </div>

              {/* Niveau */}
              <div className="creer-cours-form-group">
                <label className="creer-cours-label">Niveau *</label>
                <select 
                  name="level" 
                  value={formData.level} 
                  onChange={handleInputChange} 
                  required
                  className="creer-cours-select"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>

              {/* Classe */}
              <div className="creer-cours-form-group">
                <label className="creer-cours-label">Classe *</label>
                {classesLoading ? (
                  <div className="creer-cours-loading">
                    Chargement des classes...
                  </div>
                ) : classes.length === 0 ? (
                  <div className="creer-cours-no-classes">
                    <strong>⚠️ Aucune classe disponible</strong>
                    <span>Créez d'abord une classe pour pouvoir créer un cours.</span>
                  </div>
                ) : (
                  <select 
                    name="class_id" 
                    value={formData.class_id} 
                    onChange={handleInputChange} 
                    required
                    className="creer-cours-select"
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
            <div className="creer-cours-buttons">
              <button 
                type="submit" 
                disabled={loading || classes.length === 0}
                className="creer-cours-submit-btn"
              >
                {loading ? "⏳ Création..." : "📚 Créer le Cours"}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/creer-classe')} 
                className="creer-cours-classes-btn"
              >
                🏫 Créer une Classe
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard-prof')} 
                className="creer-cours-dashboard-btn"
              >
                🏠 Tableau de Bord
              </button>
            </div>

            {/* Debug info */}
            <div className="creer-cours-debug">
              <strong>Debug Info:</strong><br />
              Fichier sélectionné: {selectedFile ? selectedFile.name : 'Aucun'}<br />
              Classes chargées: {classes.length}<br />
              Données formulaire: {JSON.stringify(formData, null, 2)}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerCours;