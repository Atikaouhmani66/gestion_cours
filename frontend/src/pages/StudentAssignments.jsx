import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './fichiersCSS/StudentAssignments.css';

function StudentAssignments() {
  const navigate = useNavigate();
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDevoirs();
  }, [navigate]);

  const fetchDevoirs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      console.log('🔍 Fetching devoirs for student:', user?.id);
      
      // Essayer les deux endpoints que nous avons créés
      const endpoints = [
        '/api/student/assignments',
        '/api/devoirs/etudiant'
      ];

      let devoirsData = [];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Essai endpoint: ${endpoint}`);
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 Réponse ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Données reçues de ${endpoint}:`, data);
            
            // Extraire les données selon la structure
            if (data.assignments && Array.isArray(data.assignments)) {
              devoirsData = data.assignments;
            } else if (data.devoirs && Array.isArray(data.devoirs)) {
              devoirsData = data.devoirs;
            } else if (Array.isArray(data)) {
              devoirsData = data;
            } else {
              devoirsData = data.assignments || data.devoirs || [];
            }
            
            if (devoirsData.length > 0) {
              console.log(`✅ ${devoirsData.length} devoirs chargés depuis ${endpoint}`);
              break;
            }
          } else {
            console.log(`❌ Endpoint ${endpoint} échoué:`, response.status);
          }
        } catch (error) {
          console.log(`❌ Erreur endpoint ${endpoint}:`, error);
        }
      }

      if (devoirsData.length > 0) {
        setDevoirs(devoirsData);
        console.log(`📚 ${devoirsData.length} devoirs chargés`);
      } else {
        setDevoirs([]);
        console.log('ℹ️ Aucun devoir trouvé');
      }

    } catch (error) {
      console.error('💥 Erreur fetch devoirs:', error);
      setError('Erreur lors du chargement des devoirs. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard-student');
  };

  const getUrgencyStatus = (dateLimite) => {
    if (!dateLimite) return { status: 'date inconnue', color: '#718096' };
    
    const aujourdHui = new Date();
    const limite = new Date(dateLimite);
    const diffTime = limite - aujourdHui;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'en retard', color: '#e53e3e' };
    if (diffDays <= 3) return { status: 'bientôt', color: '#ed8936' };
    return { status: 'en cours', color: '#48bb78' };
  };

  const handleDownload = async (devoirId, fileName) => {
    try {
      console.log(`Tentative de téléchargement pour le devoir ${devoirId}, fichier: ${fileName}`);
      
      if (!fileName) {
        alert('Aucun fichier disponible pour ce devoir');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Essayer différentes routes possibles pour le téléchargement
      const possibleRoutes = [
        `/api/devoirs/${devoirId}/file`,
        `/api/assignments/${devoirId}/file`,
        `/api/student/assignments/${devoirId}/file`,
        `/api/files/devoir/${devoirId}`,
        `/api/download/devoir/${devoirId}`
      ];

      let downloadSuccess = false;

      for (const route of possibleRoutes) {
        try {
          console.log(`Essai de téléchargement via: ${route}`);
          const response = await fetch(`http://localhost:5000${route}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            
            if (blob && blob.size > 0) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', fileName);
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
              downloadSuccess = true;
              console.log(`Téléchargement réussi via: ${route}`);
              break;
            }
          }
        } catch (routeError) {
          console.log(`Route ${route} échouée:`, routeError.message);
          continue;
        }
      }

      if (!downloadSuccess) {
        throw new Error('Aucune route de téléchargement valide trouvée');
      }

    } catch (error) {
      console.error('Erreur détaillée téléchargement:', error);
      
      let errorMessage = 'Erreur lors du téléchargement du fichier';
      
      if (error.message.includes('Aucune route')) {
        errorMessage = 'Service de téléchargement temporairement indisponible';
      }
      
      alert(errorMessage);
    }
  };

  // Vérifier si un devoir a un fichier disponible
  const hasFileAvailable = (devoir) => {
    return devoir.fichier && devoir.fichier.trim() !== '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de vos devoirs...</p>
      </div>
    );
  }

  return (
    <div className="student-assignments-container">
      <header className="student-assignments-header">
        <button onClick={handleBack} className="back-button">
          ← Retour au Dashboard
        </button>
        <h1 className="title">Mes Devoirs</h1>
        <div className="header-actions">
          <span className="counter">
            {devoirs.length} devoir{devoirs.length > 1 ? 's' : ''}
          </span>
          <button onClick={fetchDevoirs} className="refresh-button">
            🔄 Actualiser
          </button>
        </div>
      </header>

      <main className="student-assignments-main">
        {error && (
          <div className="error-alert">
            <div className="error-content">
              <strong>Erreur:</strong> {error}
            </div>
            <button onClick={fetchDevoirs} className="retry-button">
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
          <strong>Debug:</strong> {devoirs.length} devoir(s) chargé(s)
        </div>

        {devoirs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Aucun devoir disponible</h3>
            <p>Vos devoirs apparaîtront ici une fois assignés par vos professeurs.</p>
            <button onClick={fetchDevoirs} className="retry-button">
              🔄 Vérifier à nouveau
            </button>
          </div>
        ) : (
          <div className="assignments-grid">
            {devoirs.map((devoir) => {
              const urgency = getUrgencyStatus(devoir.date_limite);
              const fileAvailable = hasFileAvailable(devoir);
              
              return (
                <div key={devoir.id} className="assignment-card">
                  <div className="assignment-header">
                    <h3 className="assignment-title">{devoir.title}</h3>
                    <span 
                      className="urgency-badge"
                      style={{ background: urgency.color }}
                    >
                      {urgency.status}
                    </span>
                  </div>
                  
                  <div className="assignment-info">
                    <p className="assignment-description">
                      {devoir.description || 'Aucune description disponible'}
                    </p>
                    
                    <div className="assignment-meta">
                      <div className="meta-item">
                        <strong>Cours:</strong> {devoir.course_title || 'Non spécifié'}
                      </div>
                      <div className="meta-item">
                        <strong>Professeur:</strong> {devoir.professeur_nom || 'Non spécifié'}
                      </div>
                      <div className="meta-item">
                        <strong>Date limite:</strong> 
                        <span style={{
                          color: urgency.color,
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}>
                          {devoir.date_limite ? 
                            new Date(devoir.date_limite).toLocaleDateString('fr-FR') : 
                            'Non spécifiée'
                          }
                        </span>
                      </div>
                      <div className="meta-item">
                        <strong>Fichier:</strong> 
                        <span style={{
                          color: fileAvailable ? '#48bb78' : '#718096',
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}>
                          {fileAvailable ? devoir.fichier : 'Non disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="assignment-actions">
                    {fileAvailable ? (
                      <button
                        onClick={() => handleDownload(devoir.id, devoir.fichier)}
                        className="download-button"
                        title={`Télécharger ${devoir.fichier}`}
                      >
                        📥 Télécharger le devoir
                      </button>
                    ) : (
                      <button
                        className="disabled-button"
                        disabled
                        title="Aucun fichier disponible"
                      >
                        📭 Fichier non disponible
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentAssignments;