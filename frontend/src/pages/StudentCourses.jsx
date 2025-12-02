import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './fichiersCSS/StudentCourses.css';

function StudentCourses() {
  const navigate = useNavigate();
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCours();
  }, [navigate]);

  const fetchCours = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/student/courses');
      setCours(response.data.courses || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      setError('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (coursId, fileName) => {
    try {
      const response = await api.get(`/api/student/courses/${coursId}/file`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const handleViewDetails = (cours) => {
    console.log('Détails du cours:', cours);
    
    alert(`Détails du cours:\n\nTitre: ${cours.title}\nDescription: ${cours.description || 'Aucune description'}\nProfesseur: ${cours.professeur_nom}\nClasse: ${cours.class_name}\nNiveau: ${cours.level}\nDate: ${new Date(cours.date_creation).toLocaleDateString('fr-FR')}`);
  };

  const handleBack = () => {
    navigate('/dashboard-student');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de vos cours...</p>
      </div>
    );
  }

  return (
    <div className="student-courses-container">
      <header className="student-courses-header">
        <button onClick={handleBack} className="back-button">
          ← Retour au Dashboard
        </button>
        <h1 className="title">Mes Cours</h1>
        <div className="header-actions">
          <span className="counter">
            {cours.length} cours disponible{cours.length > 1 ? 's' : ''}
          </span>
        </div>
      </header><br></br><br></br><br></br>

      <main className="student-courses-main">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {cours.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Aucun cours disponible</h3>
            <p>Vos cours apparaîtront ici une fois assignés par vos professeurs.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {cours.map((cour) => (
              <div key={cour.id} className="course-card">
                <div className="course-header">
                  <h3 className="course-title">{cour.title}</h3>
                  <span className="course-level">{cour.level}</span>
                </div>
                
                <div className="course-info">
                  <p className="course-description">
                    {cour.description || 'Aucune description disponible'}
                  </p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <strong>Classe:</strong> {cour.class_name}
                    </div>
                    <div className="meta-item">
                      <strong>Professeur:</strong> {cour.professeur_nom}
                    </div>
                    <div className="meta-item">
                      <strong>Date:</strong> {new Date(cour.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div className="course-actions">
                  {cour.fichier && (
                    <button
                      onClick={() => handleDownload(cour.id, cour.fichier)}
                      className="download-button"
                    >
                      📥 Télécharger le cours
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(cour)}
                    className="view-button"
                  >
                    👁️ Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentCourses;