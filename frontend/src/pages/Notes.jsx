import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/Notes.css';

const Notes = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("notes");
  const [cours, setCours] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingCours, setLoadingCours] = useState(true);

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
    fetchCours();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedCours) {
      fetchEtudiantsPourCours(selectedCours);
    }
  }, [selectedCours]);

  // Fonction pour récupérer les classes
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Aucun token trouvé');
        setLoadingClasses(false);
        return;
      }

      console.log('🔍 Fetching classes...');
      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Réponse classes - Status:', response.status);
      
      if (response.ok) {
        const classesData = await response.json();
        console.log('🏫 Classes reçues:', classesData);
        
        if (Array.isArray(classesData)) {
          setClasses(classesData);
          console.log(`✅ ${classesData.length} classes chargées`);
        } else if (classesData.classes && Array.isArray(classesData.classes)) {
          setClasses(classesData.classes);
          console.log(`✅ ${classesData.classes.length} classes chargées`);
        } else {
          console.warn('⚠️ Structure de données inattendue:', classesData);
          setClasses([]);
        }
      } else {
        console.error('❌ Erreur HTTP:', response.status);
        await tryAlternativeEndpoints(token);
      }
    } catch (error) {
      console.error('💥 Erreur fetch classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // FONCTION CORRIGÉE : Récupération de tous les cours
  const fetchCours = async () => {
    try {
      setLoadingCours(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Aucun token trouvé pour fetchCours');
        setCours([]);
        return;
      }

      console.log('🔍 Fetching tous les cours...');
      
      // Essayer plusieurs endpoints possibles
      const endpoints = [
        'http://localhost:5000/api/courses',
        'http://localhost:5000/api/courses/professeur',
        'http://localhost:5000/api/courses/teacher',
        'http://localhost:5000/api/teacher/courses',
        'http://localhost:5000/api/professeur/courses'
      ];

      let coursData = [];
      let successfulEndpoint = '';
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Essai endpoint cours: ${endpoint}`);
          const response = await fetch(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 Status pour ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Données reçues de ${endpoint}:`, data);
            
            // Gérer différentes structures de réponse
            if (Array.isArray(data)) {
              coursData = data;
              successfulEndpoint = endpoint;
              break;
            } else if (data.courses && Array.isArray(data.courses)) {
              coursData = data.courses;
              successfulEndpoint = endpoint;
              break;
            } else if (data.data && Array.isArray(data.data)) {
              coursData = data.data;
              successfulEndpoint = endpoint;
              break;
            } else {
              console.log('⚠️ Structure de données non reconnue:', data);
            }
          } else {
            console.log(`❌ Endpoint ${endpoint} - Status: ${response.status}`);
          }
        } catch (error) {
          console.log(`💥 Erreur avec endpoint ${endpoint}:`, error);
        }
      }

      console.log('📚 Tous les cours chargés:', coursData);
      console.log('🔗 Endpoint réussi:', successfulEndpoint);
      
      if (coursData.length > 0) {
        setCours(coursData);
        console.log(`✅ ${coursData.length} cours chargés avec succès`);
        
        // DEBUG: Afficher les IDs de classe disponibles dans les cours
        const classIdsInCourses = [...new Set(coursData.map(course => course.class_id))];
        console.log('🏫 IDs de classe présents dans les cours:', classIdsInCourses);
      } else {
        console.warn('⚠️ Aucun cours trouvé avec aucun endpoint');
        setCours([]);
      }

    } catch (error) {
      console.error('💥 Erreur chargement cours:', error);
      setCours([]);
    } finally {
      setLoadingCours(false);
    }
  };

  // Fonction alternative pour récupérer les cours par classe
  const fetchCoursParClasse = async (classeId) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`🔍 Fetching cours pour classe: ${classeId}`);
      
      const response = await fetch(`http://localhost:5000/api/classes/${classeId}/courses`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📚 Cours pour classe ${classeId}:`, data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Erreur fetch cours par classe:', error);
      return [];
    }
  };

  // Essayer d'autres endpoints si le premier échoue
  const tryAlternativeEndpoints = async (token) => {
    const endpoints = [
      'http://localhost:5000/api/classes/professeur',
      'http://localhost:5000/api/classes/teacher',
      'http://localhost:5000/api/teacher/classes'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Essai endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Succès avec endpoint: ${endpoint}`, data);
          
          if (Array.isArray(data)) {
            setClasses(data);
            return;
          } else if (data.classes && Array.isArray(data.classes)) {
            setClasses(data.classes);
            return;
          }
        }
      } catch (error) {
        console.log(`❌ Échec endpoint: ${endpoint}`, error);
      }
    }
  };

  const fetchEtudiantsPourCours = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log(`🔍 Fetching étudiants pour cours: ${courseId}`);
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/students`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const etudiantsData = await response.json();
        console.log('👨‍🎓 Étudiants reçus:', etudiantsData);
        setEtudiants(etudiantsData);
        
        // Récupérer les notes existantes
        const notesResponse = await fetch(`http://localhost:5000/api/courses/${courseId}/notes`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const notesInitiales = {};
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          console.log('📊 Notes existantes:', notesData);
          
          if (notesData.notes && Array.isArray(notesData.notes)) {
            notesData.notes.forEach(note => {
              notesInitiales[note.etudiant_id] = note.note.toString();
            });
          }
        } else {
          console.log('Aucune note existante pour ce cours');
        }

        // Initialiser les notes à vide pour les étudiants sans note
        etudiantsData.forEach(etudiant => {
          if (!notesInitiales[etudiant.id]) {
            notesInitiales[etudiant.id] = '';
          }
        });
        
        setNotes(notesInitiales);
      } else {
        console.error('Erreur chargement étudiants:', response.status);
        setEtudiants([]);
      }
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (etudiantId, valeur) => {
    if (valeur === '' || (parseFloat(valeur) >= 0 && parseFloat(valeur) <= 20)) {
      setNotes(prev => ({
        ...prev,
        [etudiantId]: valeur
      }));
    }
  };

  const sauvegarderNotes = async () => {
    if (!selectedCours) {
      alert('❌ Veuillez sélectionner un cours');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const notesASauvegarder = Object.entries(notes)
        .filter(([etudiantId, note]) => note !== '' && note !== null && note !== undefined)
        .map(([etudiantId, note]) => ({
          etudiant_id: parseInt(etudiantId),
          course_id: parseInt(selectedCours),
          note: parseFloat(note),
          date_evaluation: new Date().toISOString().split('T')[0]
        }));

      console.log('📝 Notes à sauvegarder:', notesASauvegarder);

      if (notesASauvegarder.length === 0) {
        alert('❌ Aucune note à sauvegarder');
        return;
      }

      const response = await fetch('http://localhost:5000/api/notes/bulk', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notes: notesASauvegarder 
        })
      });

      const data = await response.json();
      console.log('📨 Réponse sauvegarde:', data);

      if (response.ok && data.success) {
        alert(`✅ ${data.message}`);
        fetchEtudiantsPourCours(selectedCours);
      } else {
        alert(`❌ ${data.message || 'Erreur lors de la sauvegarde des notes'}`);
      }
    } catch (error) {
      console.error('💥 Erreur sauvegarde notes:', error);
      alert('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCoursChange = (coursId) => {
    setSelectedCours(coursId);
    const coursSelectionne = cours.find(c => c.id === parseInt(coursId));
    if (coursSelectionne) {
      setSelectedClasse(coursSelectionne.class_id || '');
    }
  };

  // FONCTION CORRIGÉE : Filtrage des cours
  const getCoursFiltres = () => {
    console.log('🔍 Filtrage des cours...');
    console.log('📚 Tous les cours:', cours);
    console.log('🏫 Classe sélectionnée:', selectedClasse);
    
    if (!selectedClasse) {
      console.log('✅ Retourne tous les cours (aucune classe sélectionnée)');
      return cours;
    }
    
    const coursFiltres = cours.filter(course => {
      const match = course.class_id === parseInt(selectedClasse);
      console.log(`📖 Cours: ${course.title}, class_id: ${course.class_id}, match: ${match}`);
      return match;
    });
    
    console.log(`📊 ${coursFiltres.length} cours filtrés pour classe ${selectedClasse}`);
    return coursFiltres;
  };

  // NOUVELLE FONCTION : Recharger les cours pour une classe
  const handleClasseChange = async (classeId) => {
    setSelectedClasse(classeId);
    setSelectedCours('');
    
    if (classeId) {
      console.log(`🔄 Rechargement des cours pour classe: ${classeId}`);
      const coursParClasse = await fetchCoursParClasse(classeId);
      if (coursParClasse.length > 0) {
        console.log(`✅ ${coursParClasse.length} cours trouvés pour cette classe`);
        // Fusionner avec les cours existants ou remplacer
        setCours(prev => {
          const autresCours = prev.filter(c => c.class_id !== parseInt(classeId));
          return [...autresCours, ...coursParClasse];
        });
      }
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    switch(menuId) {
      case "dashboard": navigate("/dashboard-prof"); break;
      case "cours": navigate("/mes-cours"); break;
      case "etudiants": navigate("/etudiants"); break;
      case "notes": navigate("/notes"); break;
      case "devoirs": navigate("/mes-devoirs"); break;
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

  return (
    <div className="notes-container">
      
      {/* Sidebar */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <h2 className="notes-sidebar-title">Espace Professeur</h2>
          <p className="notes-sidebar-subtitle">Prof. {user?.nom}</p>
        </div>
        
        <nav className="notes-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMenuClick(item.id)}
              className={`notes-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="notes-logout-container">
          <button onClick={handleLogout} className="notes-logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="notes-main">
        <header className="notes-header">
          <div className="notes-header-content">
            <div>
              <h1 className="notes-title">
                📝 Gérer les Notes
              </h1>
              <p className="notes-subtitle">
                Saisir et modifier les notes de vos étudiants
              </p>
            </div>
          </div>
        </header>

        <div style={{ marginTop: '100px' }}></div>

        {/* Filtrage par classe */}
        <div className="notes-filters">
          <div className="notes-filter-group">
            <h3 className="notes-filter-title">🏫 Filtrer par Classe</h3>
            
            {loadingClasses ? (
              <div className="notes-loading-classes">
                <span>Chargement des classes...</span>
              </div>
            ) : (
              <>
                <select
                  value={selectedClasse}
                  onChange={(e) => handleClasseChange(e.target.value)}
                  className="notes-class-select"
                >
                  <option value="">Toutes les classes</option>
                  {classes.length > 0 ? (
                    classes.map(classe => (
                      <option key={classe.id} value={classe.id}>
                        {classe.nom} {classe.niveau ? `- ${classe.niveau}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucune classe disponible</option>
                  )}
                </select>
                <div className="notes-classes-info">
                  {classes.length > 0 ? (
                    <span>{classes.length} classe(s) trouvée(s)</span>
                  ) : (
                    <span className="notes-no-classes-warning">
                      ⚠️ Aucune classe n'a pu être chargée
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sélection du cours - VERSION CORRIGÉE */}
        <div className="notes-course-selection">
          <h3 className="notes-course-title">📚 Sélectionnez un Cours</h3>
          
          {loadingCours ? (
            <div className="notes-loading-courses">
              <span>Chargement des cours...</span>
            </div>
          ) : (
            <>
              <select
                value={selectedCours}
                onChange={(e) => handleCoursChange(e.target.value)}
                className="notes-course-select"
              >
                <option value="">Sélectionnez un cours</option>
                {getCoursFiltres().length > 0 ? (
                  getCoursFiltres().map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title || course.nom || 'Cours sans nom'} - 
                      {course.class_name || `Classe ${course.class_id}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {selectedClasse ? 'Aucun cours pour cette classe' : 'Aucun cours disponible'}
                  </option>
                )}
              </select>
              
              <div className="notes-courses-info">
                {getCoursFiltres().length > 0 ? (
                  <span>{getCoursFiltres().length} cours disponible(s)</span>
                ) : selectedClasse ? (
                  <div className="notes-no-courses">
                    <strong>⚠️ Aucun cours disponible pour cette classe</strong><br/>
                    <span style={{ fontSize: '14px' }}>
                      Créez un cours pour cette classe ou sélectionnez une autre classe.
                    </span>
                    <button 
                      onClick={() => navigate('/creer-cours')}
                      className="notes-create-course-btn"
                      style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ➕ Créer un cours
                    </button>
                  </div>
                ) : (
                  <div className="notes-no-courses">
                    <strong>⚠️ Aucun cours disponible</strong><br/>
                    <span style={{ fontSize: '14px' }}>
                      Créez d'abord un cours pour pouvoir saisir des notes.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Formulaire de saisie des notes */}
        {selectedCours && (
          <div className="notes-form">
            <div className="notes-form-header">
              <h3 className="notes-form-title">
                👨‍🎓 Saisie des Notes - {cours.find(c => c.id === parseInt(selectedCours))?.title}
                {selectedClasse && (
                  <span className="notes-class-badge">
                    🏫 {classes.find(c => c.id === parseInt(selectedClasse))?.nom}
                  </span>
                )}
              </h3>
              <div className="notes-actions">
                <button 
                  onClick={sauvegarderNotes}
                  disabled={loading}
                  className="notes-save-btn"
                >
                  {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder les Notes'}
                </button>
                <button 
                  onClick={() => fetchEtudiantsPourCours(selectedCours)}
                  className="notes-refresh-btn"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>

            {loading ? (
              <div className="notes-loading">
                <div>Chargement des étudiants et des notes...</div>
              </div>
            ) : etudiants.length === 0 ? (
              <div className="notes-no-students">
                <div className="notes-no-students-icon">👨‍🎓</div>
                <h4 className="notes-no-students-title">Aucun étudiant trouvé</h4>
                <p>Aucun étudiant n'est inscrit dans ce cours pour le moment.</p>
              </div>
            ) : (
              <div className="notes-table-container">
                <div className="notes-stats">
                  <span className="notes-stats-text">
                    {Object.values(notes).filter(note => note !== '').length} / {etudiants.length} notes saisies
                  </span>
                  {selectedClasse && (
                    <span className="notes-class-info">
                      Classe: {classes.find(c => c.id === parseInt(selectedClasse))?.nom}
                    </span>
                  )}
                </div>
                <table className="notes-table">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Email</th>
                      <th style={{ textAlign: 'center', width: '150px' }}>Note /20</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiants.map(etudiant => (
                      <tr key={etudiant.id}>
                        <td>
                          <div className="notes-student-info">
                            <div className="notes-student-avatar">
                              {etudiant.nom?.charAt(0).toUpperCase() || 'E'}
                            </div>
                            {etudiant.nom || 'Étudiant sans nom'}
                          </div>
                        </td>
                        <td className="notes-student-email">
                          {etudiant.email || 'Aucun email'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={notes[etudiant.id] || ''}
                            onChange={(e) => handleNoteChange(etudiant.id, e.target.value)}
                            className="notes-input"
                            placeholder="0-20"
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {notes[etudiant.id] ? (
                            <span className="notes-status-saved">💾 Sauvegardée</span>
                          ) : (
                            <span className="notes-status-unsaved">📝 À saisir</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;