import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './fichiersCSS/VoirCours.css';

const VoirCours = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cours, setCours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCours(result.data.course);
      } else {
        setError('Cours non trouvé');
      }
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleDownloadFile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = cours.fichier;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('❌ Erreur lors du téléchargement du fichier');
      }
    } catch (error) {
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📕';
      case 'doc': case 'docx': return '📘';
      case 'ppt': case 'pptx': return '📙';
      case 'jpg': case 'jpeg': case 'png': return '🖼️';
      case 'zip': case 'rar': return '📦';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-icon">⏳</div>
          <div className="loading-text">Chargement du cours...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2 className="error-title">Erreur</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate('/mes-cours')}
            className="error-button"
          >
            ← Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voir-cours-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Espace Professeur</h2>
          <p>Détails du cours</p>
        </div>
        
        <div className="sidebar-actions">
          <button 
            onClick={() => navigate('/mes-cours')}
            className="sidebar-button back-button"
          >
            ← Retour aux cours
          </button>
          
          <button 
            onClick={() => navigate('/creer-cours')}
            className="sidebar-button new-button"
          >
            ➕ Nouveau cours
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="course-header">
          <div className="header-content">
            <div>
              <h1 className="course-title">
                {cours.title}
              </h1>
              <p className="course-subtitle">
                Détails complets du cours
              </p>
            </div>
            <span className="level-badge">
              {cours.level}
            </span>
          </div>
        </header>

        <div className="course-content">
          
          {/* Section Description */}
          <div className="section">
            <h3 className="section-title">
              📝 Description
            </h3>
            <div className="description-content">
              {cours.description ? (
                <p className="description-text">
                  {cours.description}
                </p>
              ) : (
                <p className="no-description">
                  Aucune description fournie
                </p>
              )}
            </div>
          </div>

          {/* Section Informations */}
          <div className="section">
            <h3 className="section-title">
              ℹ️ Informations
            </h3>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">
                  🏫 Classe
                </div>
                <div className="info-value">
                  {cours.class_name || 'Non assignée'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">
                  📅 Date de création
                </div>
                <div className="info-value">
                  {new Date(cours.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">
                  🎯 Niveau
                </div>
                <div className="info-value">
                  {cours.level}
                </div>
              </div>
            </div>
          </div>

          {/* Section Fichier */}
          {cours.fichier && (
            <div className="section">
              <h3 className="section-title">
                📎 Fichier attaché
              </h3>
              <div className="file-section">
                <div className="file-info">
                  <span className="file-icon">
                    {getFileIcon(cours.fichier)}
                  </span>
                  <div className="file-details">
                    <div className="file-name">
                      {cours.fichier}
                    </div>
                    <div className="file-status">
                      Fichier disponible au téléchargement
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleDownloadFile}
                  className="download-button"
                >
                  <span>⬇️</span>
                  Télécharger
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="actions-section">
            <h4 className="actions-title">
              Actions
            </h4>
            <div className="actions-buttons">
              <button 
                onClick={() => navigate(`/modifier-cours/${cours.id}`)}
                className="action-button edit-button"
              >
                ✏️ Modifier ce cours
              </button>
              
              <button 
                onClick={() => navigate('/mes-cours')}
                className="action-button view-all-button"
              >
                📚 Voir tous les cours
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoirCours;