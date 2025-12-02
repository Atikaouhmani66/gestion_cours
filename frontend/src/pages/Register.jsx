import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    role: '',
    class_id: ''
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [classesLoading, setClassesLoading] = useState(true);

  // Récupérer les classes au chargement
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setClassesLoading(true);
      console.log('🔄 Chargement des classes...');
      
      // Essayer différentes routes possibles pour récupérer les classes
      const possibleRoutes = [
        'http://localhost:5000/api/classes/all',
        'http://localhost:5000/api/classes',
        'http://localhost:5000/api/all-classes',
        'http://localhost:5000/api/professeur/classes/all'
      ];

      let classesData = [];

      for (const route of possibleRoutes) {
        try {
          console.log(`🔍 Essai de la route: ${route}`);
          const response = await fetch(route);
          
          if (response.ok) {
            const data = await response.json();
            // Gérer différents formats de réponse
            classesData = data.classes || data || [];
            console.log(`✅ Classes chargées via ${route}:`, classesData);
            
            // Debug: afficher la structure des données
            if (classesData.length > 0) {
              console.log('📊 Structure de la première classe:', classesData[0]);
              console.log('🔑 Clés disponibles:', Object.keys(classesData[0]));
            }
            
            break;
          }
        } catch (error) {
          console.log(`❌ Route ${route} échouée:`, error.message);
          continue;
        }
      }

      if (classesData.length === 0) {
        console.log('⚠️ Aucune classe trouvée via les routes testées');
        // Données de démonstration pour le test
        classesData = [
          {
            id: 1,
            nom_matiere: 'Mathématiques',
            niveau: 'Terminale',
            annee_scolaire: '2023-2024',
            professeur_nom: 'M. Dupont'
          },
          {
            id: 2,
            nom_matiere: 'Physique-Chimie',
            niveau: 'Première',
            annee_scolaire: '2023-2024',
            professeur_nom: 'Mme Martin'
          }
        ];
        console.log('📚 Données de démonstration chargées');
      }

      setClasses(classesData);
      
    } catch (error) {
      console.error('❌ Erreur chargement classes:', error);
      // Charger des données de démonstration en cas d'erreur
      setClasses([
        {
          id: 1,
          nom_matiere: 'Mathématiques',
          niveau: 'Terminale',
          annee_scolaire: '2023-2024',
          professeur_nom: 'M. Dupont'
        },
        {
          id: 2,
          nom_matiere: 'Physique-Chimie',
          niveau: 'Première',
          annee_scolaire: '2023-2024',
          professeur_nom: 'Mme Martin'
        }
      ]);
    } finally {
      setClassesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation supplémentaire pour les étudiants
    if (formData.role === 'student' && !formData.class_id) {
      setMessage('❌ Veuillez sélectionner une classe pour les étudiants');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('✅ Compte créé avec succès! Vous allez être redirigé vers la page de connexion...');
        
        // Redirection après 3 secondes pour laisser voir le message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } else {
        setMessage(`❌ Erreur: ${result.message || 'Erreur lors de la création du compte'}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le nom d'affichage de la classe
  const getClassName = (classe) => {
    // Essayer différentes clés possibles pour le nom
    const className = 
      classe.nom_matiere || 
      classe.nom || 
      classe.name || 
      classe.libelle || 
      'Classe sans nom';
    
    return className;
  };

  // Fonction pour obtenir le niveau
  const getClassLevel = (classe) => {
    return classe.niveau || classe.level || 'Niveau non spécifié';
  };

  // Fonction pour obtenir l'année scolaire
  const getSchoolYear = (classe) => {
    return classe.annee_scolaire || classe.annee || classe.school_year || 'Année non spécifiée';
  };

  // Fonction pour obtenir le nom du professeur
  const getProfessorName = (classe) => {
    return classe.professeur_nom || classe.professeur || classe.teacher_name || 'Professeur non spécifié';
  };

  return (
    <div className="register-container">
      <h2 className="register-title">
        📝 Inscription
      </h2>
      
      {message && (
        <div className={`register-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-form-group">
          <label className="register-label">
            👤 Nom complet *
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
            className="register-input"
          />
        </div>

        <div className="register-form-group">
          <label className="register-label">
            📧 Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="register-input"
          />
        </div>

        <div className="register-form-group">
          <label className="register-label">
            🔒 Mot de passe *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
            className="register-input"
          />
        </div>

        <div className="register-form-group">
          <label className="register-label">
            🎭 Rôle *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className="register-select"
          >
            <option value="">Sélectionnez un rôle</option>
            <option value="student">Étudiant</option>
            <option value="professeur">Professeur</option>
          </select>
        </div>

        {/* Champ classe - seulement visible pour les étudiants */}
        {formData.role === 'student' && (
          <div className="register-form-group">
            <label className="register-label">
              🏫 Classe *
            </label>
            
            {classesLoading ? (
              <div className="register-loading-container">
                <div className="register-spinner"></div>
                Chargement des classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="register-no-classes">
                ⚠️ Aucune classe disponible pour le moment.
                <br />
                <small>Contactez l'administrateur pour créer une classe.</small>
              </div>
            ) : (
              <>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  required
                  className="register-select"
                >
                  <option value="">Sélectionnez une classe</option>
                  {classes.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {getClassName(classe)} - {getClassLevel(classe)} 
                      {getSchoolYear(classe) && ` (${getSchoolYear(classe)})`}
                      {getProfessorName(classe) && ` - ${getProfessorName(classe)}`}
                    </option>
                  ))}
                </select>
                <div className="register-classes-count">
                  📚 {classes.length} classe{classes.length > 1 ? 's' : ''} disponible{classes.length > 1 ? 's' : ''}
                </div>
                
                {/* Debug: afficher les données brutes */}
                <details className="register-debug-details">
                  <summary>Debug: Structure des données</summary>
                  <pre className="register-debug-pre">
                    {JSON.stringify(classes.slice(0, 2), null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || (formData.role === 'student' && !formData.class_id && !classesLoading)}
          className="register-submit-btn"
        >
          {loading ? '⏳ Création en cours...' : '📝 Créer le compte'}
        </button>
      </form>

      {/* Lien vers login */}
      <div className="register-login-link">
        <p className="register-login-text">
          Déjà un compte ? 
          <button 
            onClick={() => navigate('/login')}
            className="register-login-btn"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;