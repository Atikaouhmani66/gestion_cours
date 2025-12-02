import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './fichiersCSS/StudentProfile.css';

function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [securityInfo, setSecurityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchSecurityInfo();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Chargement du profil étudiant...');
      
      const response = await api.get('/api/student/profile');
      console.log('✅ Réponse API profil:', response.data);
      
      if (response.data.success) {
        setProfile(response.data.profile);
        setFormData({
          nom: response.data.profile.nom,
          email: response.data.profile.email
        });
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors du chargement du profil';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityInfo = async () => {
    try {
      setSecurityLoading(true);
      const response = await api.get('/api/student/security-info');
      if (response.data.success) {
        setSecurityInfo(response.data.securityInfo);
      }
    } catch (error) {
      console.error('❌ Erreur chargement infos sécurité:', error);
      setSecurityInfo({
        derniere_connexion: new Date().toISOString(),
        date_creation_compte: new Date().toISOString(),
        nb_changements_mdp: 0
      });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard-student');
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      nom: profile.nom,
      email: profile.email
    });
    setMessage('');
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await api.put('/api/student/profile', formData);
      
      if (response.data.success) {
        setProfile(response.data.profile);
        setEditing(false);
        setMessage('Profil mis à jour avec succès!');
        
        const userData = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...userData, nom: formData.nom, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setPasswordError('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setPasswordError('');

      if (passwordData.newPassword.length < 6) {
        setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
        return;
      }

      const response = await api.put('/api/student/change-password', passwordData);
      
      if (response.data.success) {
        setMessage('Mot de passe mis à jour avec succès!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        fetchSecurityInfo();
      } else {
        setPasswordError(response.data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur changement mot de passe:', error);
      setPasswordError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const cancelPasswordChange = () => {
    setShowChangePassword(false);
    setPasswordError('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengths = {
      0: { strength: 'weak', text: 'Très faible' },
      1: { strength: 'weak', text: 'Faible' },
      2: { strength: 'medium', text: 'Moyen' },
      3: { strength: 'medium', text: 'Bon' },
      4: { strength: 'strong', text: 'Fort' },
      5: { strength: 'strong', text: 'Très fort' }
    };

    return strengths[strength] || strengths[0];
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="student-profile-container">
        <div className="error-alert">
          {error || 'Impossible de charger votre profil'}
          <button onClick={fetchProfile} className="retry-button">
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <header className="student-profile-header">
        <button onClick={handleBack} className="back-button">
          ← Retour au Dashboard
        </button>
        <h1 className="title">Mon Profil</h1>
        <div className="header-actions">
          <span className="role-badge">ÉTUDIANT</span>
        </div>
      </header>

      <main className="student-profile-main">
        {message && (
          <div className="success-alert">
            {message}
          </div>
        )}

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="profile-grid">
          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Informations Personnelles</h2>
              {!editing && (
                <button onClick={handleEdit} className="edit-button">
                  ✏️ Modifier
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label className="label">Nom complet</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    💾 Enregistrer
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-button">
                    ❌ Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <strong>Nom complet:</strong> {profile.nom}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {profile.email}
                </div>
                <div className="info-item">
                  <strong>Rôle:</strong> 
                  <span className="role-text">Étudiant</span>
                </div>
                <div className="info-item">
                  <strong>Classe:</strong> {profile.class_name || 'Non assignée'}
                </div>
                <div className="info-item">
                  <strong>Niveau:</strong> {profile.class_niveau || 'Non spécifié'}
                </div>
                <div className="info-item">
                  <strong>Promotion:</strong> {profile.promotion || '2023-2024'}
                </div>
                <div className="info-item">
                  <strong>ID Étudiant:</strong> {profile.id}
                </div>
              </div>
            )}
          </div>

          <div className="security-card">
            <h2 className="card-title">Sécurité</h2>
            
            {securityLoading ? (
              <div className="security-loading">
                Chargement des informations de sécurité...
              </div>
            ) : (
              <div className="security-info">
                <div className="security-item">
                  <span className="security-label">Mot de passe</span>
                  <span className="security-status">••••••••</span>
                  <button onClick={handleChangePassword} className="security-button">
                    Changer
                  </button>
                </div>
                <div className="security-item">
                  <span className="security-label">Dernière connexion</span>
                  <span className="security-status">
                    {securityInfo?.derniere_connexion 
                      ? new Date(securityInfo.derniere_connexion).toLocaleDateString('fr-FR')
                      : 'Aujourd\'hui'
                    }
                  </span>
                </div>
                <div className="security-item">
                  <span className="security-label">Compte créé le</span>
                  <span className="security-status">
                    {securityInfo?.date_creation_compte 
                      ? new Date(securityInfo.date_creation_compte).toLocaleDateString('fr-FR')
                      : 'Date inconnue'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showChangePassword && (
        <div className="password-overlay">
          <div className="password-modal">
            <h3>Changer le mot de passe</h3>
            
            {passwordError && (
              <div className="error-alert">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="password-form-group">
                <label className="password-label">Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="password-form-group">
                <label className="password-label">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`password-input password-${passwordStrength.strength}`}
                  required
                  autoComplete="new-password"
                  minLength="6"
                />
                {passwordData.newPassword && (
                  <div className={`password-strength password-${passwordStrength.strength}`}>
                    Force: {passwordStrength.text}
                  </div>
                )}
              </div>

              <div className="password-form-group">
                <label className="password-label">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`password-input ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'password-input-error' : ''}`}
                  required
                  autoComplete="new-password"
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <div className="password-error">
                    Les mots de passe ne correspondent pas
                  </div>
                )}
              </div>

              <div className="password-actions">
                <button 
                  type="button" 
                  onClick={cancelPasswordChange}
                  className="cancel-button"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="save-button"
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    passwordData.newPassword.length < 6
                  }
                >
                  💾 Changer le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;