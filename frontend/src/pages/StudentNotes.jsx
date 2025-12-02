import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/StudentNotes.css';

function StudentNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotes();
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo('Début du chargement...');
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      console.log('🔍 Utilisateur:', user);
      setDebugInfo(`Utilisateur: ${user?.id} - ${user?.nom}`);

      if (!user || !user.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      // Endpoints à tester
      const endpoints = [
        `/api/students/${user.id}/grades`,
        `/api/etudiants/${user.id}/notes`,
        '/api/notes/etudiant',
        '/api/grades/student',
        '/api/student/grades',
        '/api/mes-notes',
        '/api/notes',
        `/api/users/${user.id}/grades`,
        '/api/student/notes'
      ];

      let notesData = [];
      let successfulEndpoint = '';
      
      for (const endpoint of endpoints) {
        try {
          const fullUrl = `http://localhost:5000${endpoint}`;
          console.log(`🔄 Test endpoint: ${fullUrl}`);
          setDebugInfo(`Test endpoint: ${endpoint}`);

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 Status: ${response.status} pour ${endpoint}`);
          setDebugInfo(`Status ${response.status} pour ${endpoint}`);

          if (response.ok) {
            const rawData = await response.json();
            console.log(`✅ Données brutes de ${endpoint}:`, rawData);
            
            // ANALYSE APPROFONDIE DE LA STRUCTURE
            console.log('🔍 Analyse de la structure:');
            console.log('Type:', typeof rawData);
            console.log('Est un tableau?', Array.isArray(rawData));
            
            if (typeof rawData === 'object' && rawData !== null) {
              console.log('Clés de l\'objet:', Object.keys(rawData));
              
              // Chercher tous les tableaux dans l'objet
              const arrayKeys = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
              console.log('Clés avec tableaux:', arrayKeys);
              
              // Afficher le contenu de chaque tableau
              arrayKeys.forEach(key => {
                console.log(`📊 Contenu de ${key}:`, rawData[key]);
                if (rawData[key].length > 0) {
                  console.log(`📝 Premier élément de ${key}:`, rawData[key][0]);
                }
              });
            }

            // Extraction des données avec plus de flexibilité
            let extractedData = [];

            if (Array.isArray(rawData)) {
              extractedData = rawData;
            } else if (rawData.grades && Array.isArray(rawData.grades)) {
              extractedData = rawData.grades;
            } else if (rawData.notes && Array.isArray(rawData.notes)) {
              extractedData = rawData.notes;
            } else if (rawData.data && Array.isArray(rawData.data)) {
              extractedData = rawData.data;
            } else if (rawData.result && Array.isArray(rawData.result)) {
              extractedData = rawData.result;
            } else {
              // Essayer toutes les clés qui pourraient contenir des notes
              const possibleKeys = ['grades', 'notes', 'data', 'result', 'evaluations', 'marks'];
              for (const key of possibleKeys) {
                if (rawData[key] && Array.isArray(rawData[key])) {
                  extractedData = rawData[key];
                  break;
                }
              }
              
              // Si toujours rien, prendre l'objet entier s'il a les bonnes propriétés
              if (extractedData.length === 0 && typeof rawData === 'object') {
                // Vérifier si l'objet a des propriétés de note
                const hasNoteProperties = rawData.note !== undefined || 
                                         rawData.grade !== undefined || 
                                         rawData.marks !== undefined;
                if (hasNoteProperties) {
                  extractedData = [rawData]; // Mettre dans un tableau
                }
              }
            }

            console.log(`📊 Données extraites de ${endpoint}:`, extractedData);
            
            if (extractedData.length > 0) {
              notesData = extractedData;
              successfulEndpoint = endpoint;
              console.log(`🎉 SUCCÈS avec ${endpoint}: ${notesData.length} notes trouvées`);
              setDebugInfo(`SUCCÈS: ${notesData.length} notes trouvées via ${endpoint}`);
              break;
            } else {
              console.log(`ℹ️ Endpoint ${endpoint} réussi mais aucune donnée extraite`);
              setDebugInfo(`Aucune donnée extraite de ${endpoint}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ Endpoint ${endpoint} échoué:`, response.status, errorText);
            setDebugInfo(`Erreur ${response.status} pour ${endpoint}`);
          }
        } catch (error) {
          console.log(`💥 Erreur pour ${endpoint}:`, error.message);
          setDebugInfo(`Erreur réseau: ${endpoint}`);
        }
      }

      console.log('📋 Données finales:', notesData);
      
      if (notesData.length > 0) {
        setNotes(notesData);
        console.log(`✅ ${notesData.length} notes chargées depuis ${successfulEndpoint}`);
        
        // Afficher la structure de la première note pour debug
        if (notesData[0]) {
          console.log('🔍 Structure de la première note:', notesData[0]);
          console.log('📝 Clés disponibles:', Object.keys(notesData[0]));
        }
      } else {
        setNotes([]);
        console.log('❌ Aucune donnée trouvée');
        setError('Aucune note trouvée. Vérifiez que des notes vous ont été attribuées.');
      }

    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard-student');
  };

  const getNoteColor = (note) => {
    if (!note && note !== 0) return '#6b7280';
    const numericNote = parseFloat(note);
    if (isNaN(numericNote)) return '#6b7280';
    if (numericNote >= 16) return '#48bb78';
    if (numericNote >= 12) return '#4299e1';
    if (numericNote >= 10) return '#ed8936';
    return '#e53e3e';
  };

  const getNoteStatus = (note) => {
    if (!note && note !== 0) return 'Non noté';
    const numericNote = parseFloat(note);
    if (isNaN(numericNote)) return 'Non noté';
    if (numericNote >= 10) return 'Admis';
    return 'Non admis';
  };

  const getFieldValue = (note, possibleKeys) => {
    for (const key of possibleKeys) {
      if (note[key] !== undefined && note[key] !== null) {
        return note[key];
      }
    }
    return 'Non spécifié';
  };

  const calculateStats = () => {
    if (notes.length === 0) return null;
    
    const validNotes = notes.filter(note => {
      const noteValue = getFieldValue(note, ['note', 'grade', 'marks', 'score', 'valeur']);
      return noteValue !== null && noteValue !== undefined && !isNaN(parseFloat(noteValue));
    });
    
    if (validNotes.length === 0) return null;
    
    const total = validNotes.reduce((sum, noteItem) => {
      const noteValue = getFieldValue(noteItem, ['note', 'grade', 'marks', 'score', 'valeur']);
      return sum + parseFloat(noteValue);
    }, 0);
    
    const moyenne = total / validNotes.length;
    const admis = validNotes.filter(noteItem => {
      const noteValue = getFieldValue(noteItem, ['note', 'grade', 'marks', 'score', 'valeur']);
      return parseFloat(noteValue) >= 10;
    }).length;
    
    const nonAdmis = validNotes.filter(noteItem => {
      const noteValue = getFieldValue(noteItem, ['note', 'grade', 'marks', 'score', 'valeur']);
      return parseFloat(noteValue) < 10;
    }).length;
    
    return {
      moyenne: moyenne.toFixed(2),
      admis,
      nonAdmis,
      total: validNotes.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de vos notes...</p>
        {debugInfo && <div className="debug-info">{debugInfo}</div>}
      </div>
    );
  }

  return (
    <div className="student-notes-container">
      <header className="student-notes-header">
        <button onClick={handleBack} className="back-button">
          ← Retour au Dashboard
        </button>
        <h1 className="title">Mes Notes</h1>
        <div className="header-actions">
          <span className="counter">
            {notes.length} note{notes.length > 1 ? 's' : ''}
          </span>
          <button onClick={fetchNotes} className="refresh-button">
            🔄 Actualiser
          </button>
        </div>
      </header>

      <main className="student-notes-main">
        {error && (
          <div className="error-alert">
            <div className="error-content">
              <strong>Erreur:</strong> {error}
            </div>
            <button onClick={fetchNotes} className="retry-button">
              🔄 Réessayer
            </button>
          </div>
        )}

        {/* Debug info */}
        <div className="debug-info" style={{ 
          background: '#f3f4f6', 
          padding: '10px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Debug:</strong> {debugInfo}
          <br />
          <strong>Notes chargées:</strong> {notes.length}
          {notes.length > 0 && (
            <>
              <br />
              <strong>Structure:</strong> {Object.keys(notes[0] || {}).join(', ')}
            </>
          )}
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.moyenne}</div>
              <div className="stat-label">Moyenne Générale</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{color: '#48bb78'}}>{stats.admis}</div>
              <div className="stat-label">Notes ≥ 10</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{color: '#e53e3e'}}>{stats.nonAdmis}</div>
              <div className="stat-label">Notes &lt; 10</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Notes valides</div>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Aucune note disponible</h3>
            <p>Vos notes apparaîtront ici une fois publiées par vos professeurs.</p>
            <div className="empty-actions">
              <button onClick={fetchNotes} className="retry-button">
                🔄 Vérifier à nouveau
              </button>
            </div>
          </div>
        ) : (
          <div className="notes-table">
            <div className="table-header">
              <h3>Détail des notes</h3>
              <span className="table-info">
                {notes.length} note{notes.length > 1 ? 's' : ''} au total
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Cours</th>
                  <th className="th">Note</th>
                  <th className="th">Statut</th>
                  <th className="th">Professeur</th>
                  <th className="th">Date</th>
                  <th className="th">Détails</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note, index) => {
                  const noteValue = getFieldValue(note, ['note', 'grade', 'marks', 'score', 'valeur']);
                  const courseName = getFieldValue(note, ['course_title', 'cours_nom', 'matiere', 'subject', 'course_name']);
                  const professor = getFieldValue(note, ['professeur_nom', 'teacher_name', 'professor', 'enseignant']);
                  const date = getFieldValue(note, ['date_evaluation', 'evaluation_date', 'date', 'created_at']);
                  
                  return (
                    <tr key={note.id || index} className="tr">
                      <td className="td">
                        <strong>{courseName}</strong>
                      </td>
                      <td className="td">
                        <span 
                          className="note-badge"
                          style={{ background: getNoteColor(noteValue) }}
                        >
                          {noteValue}/20
                        </span>
                      </td>
                      <td className="td">
                        <span 
                          className="status-badge"
                          style={{
                            background: parseFloat(noteValue) >= 10 ? '#c6f6d5' : '#fed7d7',
                            color: parseFloat(noteValue) >= 10 ? '#22543d' : '#742a2a'
                          }}
                        >
                          {getNoteStatus(noteValue)}
                        </span>
                      </td>
                      <td className="td">
                        {professor}
                      </td>
                      <td className="td">
                        {date ? new Date(date).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                      </td>
                      <td className="td">
                        <button 
                          onClick={() => console.log('Détails de la note:', note)}
                          className="details-button"
                          style={{
                            background: 'transparent',
                            border: '1px solid #d1d5db',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🔍
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentNotes;