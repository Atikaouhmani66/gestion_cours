import React from "react";
import { useNavigate } from "react-router-dom";
import "./fichiersCSS/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <div className="header-content">
            <a href="#" className="logo">
              <i className="fas fa-graduation-cap"></i>
              Gestion Cours
            </a>
            <div className="mobile-menu">
              <i className="fas fa-bars"></i>
            </div>
            <nav>
              <ul>
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#how-it-works">Comment ça marche</a></li>
                <li><a href="#testimonials">Témoignages</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Bienvenue à Gestion Cours</h1>
            <p>Simplifiez la gestion de vos cours avec notre plateforme intuitive et performante. Conçue pour les établissements d'enseignement et les formateurs indépendants.</p>
            <p>Choisissez votre espace :</p>
            <div className="buttons">
              <button className="btn btn-primary" onClick={() => navigate("/register")}>
                Inscription
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/login")}>
                Connexion
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Fonctionnalités Principales</h2>
          <p className="section-subtitle">Découvrez comment notre plateforme peut transformer votre gestion de cours</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Inscription et Connexion sécurisées</h3>
              <p>Les professeurs et les étudiants peuvent créer un compte et se connecter selon leur rôle..</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Gestion des Étudiants</h3>
              <p>Suivez les progrès de vos étudiants, gérez leurs inscriptions et communiquez efficacement.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Messagerie interne</h3>
              <p>Communication directe entre profs et étudiants (messages simples, notifications).</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche</h2>
          <p className="section-subtitle">En seulement 3 étapes simples, optimisez votre gestion de cours</p>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Inscription</h3>
              <p>Créez votre compte en quelques minutes</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configuration</h3>
              <p>Personnalisez votre espace selon vos besoins</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Utilisation</h3>
              <p>Commencez à gérer vos cours efficacement</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title">Ce que disent nos utilisateurs</h2>
          <p className="section-subtitle">Découvrez les expériences de ceux qui utilisent déjà notre plateforme</p>
          
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                Cette plateforme a révolutionné notre gestion des cours. Nous économisons plusieurs heures par semaine grâce à son automatisation.
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div>
                  <h4>Marie Johnson</h4>
                  <p>Directrice, Lycée Descartes</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-text">
                Interface intuitive et fonctionnalités complètes. Exactement ce dont j'avais besoin pour gérer mes formations en ligne.
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">PD</div>
                <div>
                  <h4>Pierre Dubois</h4>
                  <p>Formateur indépendant</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-text">
                Le support client est réactif et les mises à jour régulières améliorent constamment l'expérience utilisateur.
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SM</div>
                <div>
                  <h4>Sophie Martin</h4>
                  <p>Coordinatrice pédagogique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Prêt à transformer votre gestion de cours ?</h2>
          <p>Rejoignez des centaines d'établissements et formateurs qui utilisent déjà notre plateforme</p>
          <div className="buttons">
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Commencer maintenant
            </button>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Gestion Cours</h3>
              <p>Plateforme de gestion de cours innovante conçue pour simplifier l'éducation.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f">FB</i></a>
                <a href="#"><i className="fab fa-twitter"></i>TW</a>
                <a href="#"><i className="fab fa-linkedin-in">LI</i></a>
                <a href="#"><i className="fab fa-instagram">IG</i></a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>Liens rapides</h3>
              <ul>
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#how-it-works">Comment ça marche</a></li>
                <li><a href="#testimonials">Témoignages</a></li>
                <li><a href="#">Tarifs</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Support</h3>
              <ul>
                <li><a href="#">Centre d'aide</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Contact</h3>
              <ul>
                <li><i className="fas fa-map-marker-alt"></i> Rue Hassan II, Jerada, Maroc</li>
                <li><i className="fas fa-phone"></i> 0609876521</li>
                <li><i className="fas fa-envelope"></i> atikaouhmani@gestioncours.fr</li>
              </ul>
            </div>
          </div>
          
          <div className="copyright">
            <p>&copy; 2025 Gestion Cours. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;