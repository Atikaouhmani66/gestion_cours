import express from 'express';//Framework pour créer le serveur web
import cors from 'cors';//Autorise les requêtes entre différents domaines (frontend/backend)
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';// Crée des tokens de sécurité
import pkg from 'pg';//Client PostgreSQL pour communiquer avec la base de données
import multer from 'multer';
import path from 'path';//Manipulation des chemins et fichiers
import fs from 'fs';//Manipulation des chemins et fichiers
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const app = express();

// Configuration pour __dirname en ES modules
//1. import.meta.url
//Katjib chemin complet dyal had fichier b format URL.



const __filename = fileURLToPath(import.meta.url);//Kat7awwel had URL → path réel f Windows/Linux.
const __dirname = path.dirname(__filename);//Katjib dossier dyal fichier,

// Middleware
app.use(cors());//Active CORS pour toutes les routes
app.use(express.json());//Permet de lire les données JSON dans les requêtes

// CONFIGURATION DE LA BASE DE DONNÉES
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestion_cours',
  password: 'atika1234',
  port: 5432
});

// Vérifier la connexion PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err);
  } else {
    console.log('✅ Connecté à PostgreSQL - Base: gestion_cours');
    console.log('🕒 Heure du serveur:', res.rows[0].now);
  }
});

// ==================== MIDDLEWARES ====================

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }

    const decoded = jwt.verify(token, 'votre_secret_jwt');
    
    const userResult = await pool.query(
      'SELECT id, nom, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
};

// MIDDLEWARE VÉRIFICATION ÉTUDIANT
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux étudiants'
    });
  }
  next();
};

// MIDDLEWARE VÉRIFICATION PROFESSEUR
const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'professeur') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux enseignants'
    });
  }
  next();
};

// ==================== CONFIGURATION MULTER ====================

// Configuration Multer pour l'upload de fichiers COURS
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/courses/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'course-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
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
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Configuration Multer pour l'upload de fichiers DEVOIRS
const storageDevoirs = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/devoirs/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'devoir-' + uniqueSuffix + extension);
  }
});

const uploadDevoir = multer({
  storage: storageDevoirs,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé pour les devoirs'), false);
    }
  }
});

// Servir les fichiers uploads statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES AUTH ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Création compte - Données reçues:', req.body);
    
    const { nom, email, password, role, class_id } = req.body;

    if (!nom || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont obligatoires'
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (nom, email, password, role, class_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email, role, class_id`,
      [nom, email, hashedPassword, role, role === 'student' ? class_id : null]
    );

    const newUser = result.rows[0];
    console.log('✅ Utilisateur créé avec PostgreSQL:', newUser);

    res.status(201).json({ 
      success: true, 
      message: 'Compte créé avec succès',
      user: newUser
    });

  } catch (error) {
    console.error('💥 Erreur register:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message 
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentative de login:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    console.log('✅ Login réussi - Rôle:', user.role);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('💥 Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// PROFIL UTILISATEUR
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('💥 Erreur profil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// ==================== ROUTES CLASSES ====================

// RÉCUPÉRER TOUTES LES CLASSES
app.get('/api/classes/all', async (req, res) => {
  try {
    console.log('📡 Route /api/classes/all appelée');
    
    const classes = await pool.query(
      `SELECT id, name, niveau, annee_scolaire, professeur_id 
       FROM classes 
       ORDER BY name ASC`
    );

    console.log(`📚 Classes disponibles:`, classes.rows.length);
    res.json(classes.rows);

  } catch (error) {
    console.error('💥 Erreur récupération classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des classes'
    });
  }
});

// CRÉER UNE CLASSE
app.post('/api/classes/create', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, niveau, annee_scolaire } = req.body;

    console.log('🏫 Création classe - Données reçues:', { name, niveau, annee_scolaire });

    if (!name || !niveau) {
      return res.status(400).json({
        success: false,
        message: 'Nom et niveau sont obligatoires'
      });
    }

    const existingClass = await client.query(
      'SELECT id FROM classes WHERE name = $1 AND professeur_id = $2',
      [name.trim(), req.user.id]
    );

    if (existingClass.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Une classe avec ce nom existe déjà'
      });
    }

    const result = await client.query(
      `INSERT INTO classes (name, niveau, annee_scolaire, professeur_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), niveau, annee_scolaire || '2023-2024', req.user.id]
    );

    console.log('✅ Classe créée avec ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: {
        class: result.rows[0]
      }
    });

  } catch (error) {
    console.error('💥 Erreur création classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la classe: ' + error.message
    });
  } finally {
    client.release();
  }
});

// RÉCUPÉRER LES CLASSES DU PROFESSEUR
app.get('/api/classes/professeur', auth, async (req, res) => {
  try {
    console.log('📡 Route /api/classes/professeur appelée');
    
    const classes = await pool.query(
      'SELECT * FROM classes ORDER BY name',
      []
    );

    console.log(`📚 Classes trouvées:`, classes.rows.length);
    res.json({
      success: true,
      data: {
        classes: classes.rows
      }
    });

  } catch (error) {
    console.error('💥 Erreur récupération classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + error.message
    });
  }
});

// RÉCUPÉRER TOUTES LES CLASSES
app.get('/api/classes', auth, async (req, res) => {
  try {
    console.log('📡 Route /api/classes appelée - User:', req.user.id);
    
    const classes = await pool.query(
      'SELECT * FROM classes ORDER BY name',
      []
    );

    console.log(`📚 Classes trouvées:`, classes.rows.length);
    res.json(classes.rows);

  } catch (error) {
    console.error('💥 Erreur récupération classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + error.message
    });
  }
});

// ==================== ROUTES COURS ====================

// CRÉER UN COURS AVEC FICHIER
app.post('/api/courses/create', auth, upload.single('fichier'), async (req, res) => {
  try {
    console.log('📁 Création cours - Données reçues:', req.body);
    console.log('📄 Fichier reçu:', req.file);

    const { title, description, level, class_id } = req.body;

    if (!title || !level || !class_id) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'Titre, niveau et classe sont obligatoires' 
      });
    }

    let fichierName = null;
    if (req.file) {
      fichierName = req.file.originalname;
      console.log('✅ Fichier sauvegardé:', fichierName);
    }

    const result = await pool.query(
      `INSERT INTO courses (title, description, level, class_id, fichier, professeur_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        title.trim(), 
        description?.trim() || '', 
        level, 
        class_id, 
        fichierName, 
        req.user.id
      ]
    );

    console.log('✅ Cours créé avec ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès' + (fichierName ? ' avec fichier' : ''),
      data: {
        course: result.rows[0]
      }
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('💥 Erreur création cours:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la création du cours' 
    });
  }
});

// RÉCUPÉRER LES COURS D'UN PROFESSEUR
app.get('/api/courses/professeur', auth, async (req, res) => {
  try {
    console.log('📚 Récupération cours pour user:', req.user.id, 'Rôle:', req.user.role);
    
    const allowedRoles = ['teacher', 'professeur', 'enseignant'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès réservé aux enseignants. Votre rôle: ${req.user.role}`
      });
    }

    const courses = await pool.query(
      `SELECT c.*, cl.name as class_name 
       FROM courses c 
       LEFT JOIN classes cl ON c.class_id = cl.id 
       WHERE c.professeur_id = $1 
       ORDER BY c.date_creation DESC`,
      [req.user.id]
    );

    console.log(`✅ Cours trouvés: ${courses.rows.length}`);
    res.json(courses.rows);

  } catch (error) {
    console.error('💥 Erreur récupération cours:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
});

// TÉLÉCHARGER UN FICHIER DE COURS
app.get('/api/courses/:id/file', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const courseResult = await pool.query(
      `SELECT c.*, cl.name as class_name 
       FROM courses c 
       LEFT JOIN classes cl ON c.class_id = cl.id 
       WHERE c.id = $1 AND c.professeur_id = $2`,
      [courseId, req.user.id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    const course = courseResult.rows[0];
    
    if (!course.fichier) {
      return res.status(404).json({
        success: false,
        message: 'Aucun fichier attaché à ce cours'
      });
    }

    const uploadsDir = path.join(__dirname, 'uploads/courses/');
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Dossier uploads non trouvé'
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const fileFound = files.find(file => {
      return file.includes('course-') && fs.existsSync(path.join(uploadsDir, file));
    });

    if (!fileFound) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }

    const filePath = path.join(uploadsDir, fileFound);
    res.download(filePath, course.fichier);

  } catch (error) {
    console.error('💥 Erreur téléchargement fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier'
    });
  }
});

// SUPPRIMER UN COURS
app.delete('/api/courses/:id', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('🗑️ Suppression cours ID:', courseId, 'par user:', req.user.id);

    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND professeur_id = $2',
      [courseId, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé ou accès non autorisé'
      });
    }

    await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);

    console.log('✅ Cours supprimé:', courseId);
    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur suppression cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours'
    });
  }
});

// RÉCUPÉRER UN COURS PAR ID
app.get('/api/courses/:id', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('👁️ Récupération cours ID:', courseId);

    const course = await pool.query(
      `SELECT c.*, cl.name as class_name, cl.id as class_id
       FROM courses c 
       LEFT JOIN classes cl ON c.class_id = cl.id 
       WHERE c.id = $1 AND c.professeur_id = $2`,
      [courseId, req.user.id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        course: course.rows[0]
      }
    });

  } catch (error) {
    console.error('💥 Erreur récupération cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours'
    });
  }
});

// MODIFIER UN COURS
app.put('/api/courses/:id', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, level, class_id } = req.body;

    console.log('✏️ Modification cours ID:', courseId, 'Données:', req.body);

    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND professeur_id = $2',
      [courseId, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé ou accès non autorisé'
      });
    }

    const result = await pool.query(
      `UPDATE courses 
       SET title = $1, description = $2, level = $3, class_id = $4, date_modification = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, description, level, class_id, courseId]
    );

    console.log('✅ Cours modifié:', result.rows[0]);
    res.json({
      success: true,
      message: 'Cours modifié avec succès',
      data: {
        course: result.rows[0]
      }
    });

  } catch (error) {
    console.error('💥 Erreur modification cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du cours'
    });
  }
});

// ==================== ROUTES DEVOIRS ====================

// CRÉER UN DEVOIR AVEC FICHIER
app.post('/api/devoirs/create', auth, uploadDevoir.single('fichier'), async (req, res) => {
  try {
    console.log('=== DÉBUT CRÉATION DEVOIR ===');
    console.log('📝 Données reçues:', req.body);
    console.log('📄 Fichier reçu:', req.file);

    const { title, description, course_id, class_id, date_limite } = req.body;

    if (!title || !course_id || !class_id || !date_limite) {
      console.log('❌ Validation échouée - champs manquants');
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'Titre, cours, classe et date limite sont obligatoires' 
      });
    }

    let fichierName = null;
    
    if (req.file) {
      fichierName = req.file.originalname;
      console.log('✅ Fichier sauvegardé:', fichierName);
    }

    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND professeur_id = $2',
      [course_id, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      console.log('❌ Cours non trouvé ou non autorisé');
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas assigner un devoir à un cours qui ne vous appartient pas'
      });
    }

    const result = await pool.query(
      `INSERT INTO devoirs (title, description, course_id, class_id, professeur_id, date_limite, fichier, statut) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'actif') RETURNING *`,
      [
        title.trim(), 
        description?.trim() || '', 
        parseInt(course_id), 
        parseInt(class_id), 
        req.user.id, 
        date_limite,
        fichierName
      ]
    );

    console.log('✅ Devoir créé avec ID:', result.rows[0].id);

    res.json({
      success: true,
      message: 'Devoir créé avec succès' + (fichierName ? ' avec fichier' : ''),
      data: {
        devoir: result.rows[0]
      }
    });

  } catch (error) {
    console.error('💥 ERREUR COMPLÈTE création devoir:', error);
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la création du devoir: ' + error.message 
    });
  }
});

// RÉCUPÉRER LES DEVOIRS D'UN PROFESSEUR
app.get('/api/devoirs/professeur', auth, async (req, res) => {
  try {
    console.log('📡 Route /api/devoirs/professeur appelée - User:', req.user.id);
    
    const devoirs = await pool.query(
      `SELECT d.*, c.title as course_title, cl.name as class_name
       FROM devoirs d 
       LEFT JOIN courses c ON d.course_id = c.id 
       LEFT JOIN classes cl ON d.class_id = cl.id 
       WHERE d.professeur_id = $1 
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    console.log('📚 Devoirs récupérés:', devoirs.rows.length);

    res.json({
      success: true,
      devoirs: devoirs.rows
    });

  } catch (error) {
    console.error('💥 Erreur récupération devoirs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des devoirs'
    });
  }
});

// SUPPRIMER UN DEVOIR
app.delete('/api/devoirs/:id', auth, async (req, res) => {
  try {
    const devoirId = req.params.id;
    console.log('🗑️ Suppression devoir ID:', devoirId, 'par user:', req.user.id);

    const devoirCheck = await pool.query(
      'SELECT * FROM devoirs WHERE id = $1 AND professeur_id = $2',
      [devoirId, req.user.id]
    );

    if (devoirCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Devoir non trouvé ou accès non autorisé'
      });
    }

    await pool.query('DELETE FROM devoirs WHERE id = $1', [devoirId]);

    console.log('✅ Devoir supprimé:', devoirId);
    res.json({
      success: true,
      message: 'Devoir supprimé avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur suppression devoir:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du devoir'
    });
  }
});

// ==================== ROUTES ÉTUDIANTS SANS CREATED_AT ====================

// ROUTE POUR RÉCUPÉRER TOUS LES ÉTUDIANTS - SANS CREATED_AT
app.get('/api/students', auth, async (req, res) => {
  try {
    console.log('📡 Route /api/students appelée - User:', req.user.id, 'Rôle:', req.user.role);
    
    if (req.user.role !== 'teacher' && req.user.role !== 'professeur' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux enseignants et administrateurs.'
      });
    }

    const students = await pool.query(`
      SELECT 
        u.id, 
        u.nom, 
        u.email, 
        u.role, 
        u.class_id,
        c.name as class_name,
        c.niveau as class_niveau
      FROM users u 
      LEFT JOIN classes c ON u.class_id = c.id 
      WHERE u.role = 'student' 
      ORDER BY u.nom ASC
    `);

    console.log('👨‍🎓 Étudiants récupérés:', students.rows.length);

    res.json({
      success: true,
      students: students.rows,
      count: students.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des étudiants: ' + error.message
    });
  }
});

// ROUTE POUR RÉCUPÉRER TOUS LES ÉTUDIANTS (alias)
app.get('/api/etudiants', auth, async (req, res) => {
  try {
    console.log('📡 Route /api/etudiants appelée - User:', req.user.id);
    
    const etudiants = await pool.query(`
      SELECT 
        u.id, 
        u.nom, 
        u.email, 
        u.role, 
        u.class_id,
        c.name as class_name,
        c.niveau as class_niveau
      FROM users u 
      LEFT JOIN classes c ON u.class_id = c.id 
      WHERE u.role = 'student' 
      ORDER BY u.nom ASC
    `);

    console.log('👨‍🎓 Étudiants récupérés:', etudiants.rows.length);

    res.json({
      success: true,
      etudiants: etudiants.rows,
      count: etudiants.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des étudiants'
    });
  }
});

// RÉCUPÉRER LES ÉTUDIANTS D'UN COURS SPÉCIFIQUE
app.get('/api/courses/:id/students', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('📡 Récupération étudiants pour cours:', courseId);

    const courseCheck = await pool.query(
      'SELECT id, class_id FROM courses WHERE id = $1 AND professeur_id = $2',
      [courseId, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé ou accès non autorisé'
      });
    }

    const classId = courseCheck.rows[0].class_id;

    const etudiants = await pool.query(
      `SELECT u.id, u.nom, u.email, u.role, u.class_id
       FROM users u 
       WHERE u.role = 'student' AND u.class_id = $1
       ORDER BY u.nom ASC`,
      [classId]
    );

    console.log('👨‍🎓 Étudiants pour cours:', etudiants.rows.length);
    res.json(etudiants.rows);

  } catch (error) {
    console.error('💥 Erreur récupération étudiants cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ==================== ROUTES ÉTUDIANT SPÉCIFIQUES ====================

// DASHBOARD ÉTUDIANT
app.get('/api/student/dashboard', auth, requireStudent, async (req, res) => {
  try {
    console.log('📊 Dashboard étudiant demandé par:', req.user.id);
    
    const coursesCount = await pool.query(
      `SELECT COUNT(DISTINCT c.id) 
       FROM courses c
       JOIN classes cl ON c.class_id = cl.id
       JOIN users u ON u.class_id = cl.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const gradesCount = await pool.query(
      `SELECT COUNT(*) FROM notes WHERE etudiant_id = $1`,
      [req.user.id]
    );

    const assignmentsCount = await pool.query(
      `SELECT COUNT(DISTINCT d.id) 
       FROM devoirs d
       JOIN classes cl ON d.class_id = cl.id
       JOIN users u ON u.class_id = cl.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const averageGrade = await pool.query(
      `SELECT AVG(note) as moyenne FROM notes WHERE etudiant_id = $1`,
      [req.user.id]
    );

    const studentInfo = await pool.query(
      `SELECT u.id, u.nom, u.email, u.role, u.class_id,
              cl.name as class_name, cl.niveau as class_niveau
       FROM users u 
       LEFT JOIN classes cl ON u.class_id = cl.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    const dashboardData = {
      success: true,
      student: studentInfo.rows[0],
      coursesCount: parseInt(coursesCount.rows[0].count),
      gradesCount: parseInt(gradesCount.rows[0].count),
      assignmentsCount: parseInt(assignmentsCount.rows[0].count),
      averageGrade: averageGrade.rows[0].moyenne ? 
        parseFloat(averageGrade.rows[0].moyenne).toFixed(1) : 0
    };

    console.log('✅ Dashboard étudiant généré:', dashboardData);
    res.json(dashboardData);

  } catch (error) {
    console.error('💥 Erreur dashboard étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du chargement du dashboard'
    });
  }
});

// COURS DE L'ÉTUDIANT
app.get('/api/student/courses', auth, requireStudent, async (req, res) => {
  try {
    console.log('📚 Cours étudiant demandés par:', req.user.id);
    
    const courses = await pool.query(
      `SELECT c.*, cl.name as class_name, 
              u.nom as professeur_nom, u.email as professeur_email
       FROM courses c
       JOIN classes cl ON c.class_id = cl.id
       JOIN users u ON c.professeur_id = u.id
       WHERE cl.id = (SELECT class_id FROM users WHERE id = $1)
       ORDER BY c.date_creation DESC`,
      [req.user.id]
    );

    console.log(`✅ ${courses.rows.length} cours trouvés pour l'étudiant`);
    
    res.json({
      success: true,
      courses: courses.rows
    });

  } catch (error) {
    console.error('💥 Erreur récupération cours étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des cours'
    });
  }
});

// PROFIL ÉTUDIANT
app.get('/api/student/profile', auth, requireStudent, async (req, res) => {
  try {
    console.log('👤 Profil étudiant demandé par:', req.user.id);
    
    const studentProfile = await pool.query(
      `SELECT 
        u.id, u.nom, u.email, u.role, u.class_id,
        cl.name as class_name, cl.niveau as class_niveau,
        cl.annee_scolaire as promotion,
        prof.nom as professeur_principal
       FROM users u 
       LEFT JOIN classes cl ON u.class_id = cl.id 
       LEFT JOIN users prof ON cl.professeur_id = prof.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (studentProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    res.json({
      success: true,
      profile: studentProfile.rows[0]
    });

  } catch (error) {
    console.error('💥 Erreur récupération profil étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
});

// METTRE À JOUR LE PROFIL ÉTUDIANT
app.put('/api/student/profile', auth, requireStudent, async (req, res) => {
  try {
    const { nom, email } = req.body;
    console.log('✏️ Mise à jour profil étudiant:', req.user.id, 'Données:', { nom, email });

    if (!nom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email sont obligatoires'
      });
    }

    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé par un autre utilisateur'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET nom = $1, email = $2
       WHERE id = $3 
       RETURNING id, nom, email, role, class_id`,
      [nom, email, req.user.id]
    );

    console.log('✅ Profil étudiant mis à jour');

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('💥 Erreur mise à jour profil étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
});
// ==================== ROUTES POUR LA GESTION DES UTILISATEURS ====================

// RÉCUPÉRER UN UTILISATEUR PAR ID
app.get('/api/users/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await pool.query(
      `SELECT 
        u.id, u.nom, u.email, u.role, u.class_id,
        c.name as class_name, c.niveau as class_niveau
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: user.rows[0]
    });

  } catch (error) {
    console.error('💥 Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'utilisateur'
    });
  }
});

// MODIFIER UN UTILISATEUR
app.put('/api/users/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { nom, email, class_id } = req.body;

    console.log('✏️ Modification utilisateur ID:', userId, 'Données:', req.body);

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé par un autre utilisateur'
      });
    }

    // Mettre à jour l'utilisateur
    const result = await pool.query(
      `UPDATE users 
       SET nom = $1, email = $2, class_id = $3
       WHERE id = $4 
       RETURNING id, nom, email, role, class_id`,
      [nom, email, class_id, userId]
    );

    console.log('✅ Utilisateur modifié:', result.rows[0]);

    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('💥 Erreur modification utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification de l\'utilisateur'
    });
  }
});

// SUPPRIMER UN UTILISATEUR
app.delete('/api/users/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('🗑️ Suppression utilisateur ID:', userId, 'par user:', req.user.id);

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = userCheck.rows[0];

    // Empêcher la suppression d'un administrateur
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un administrateur'
      });
    }

    // Supprimer l'utilisateur
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    console.log('✅ Utilisateur supprimé:', userId);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur suppression utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'utilisateur'
    });
  }
});

// ==================== ROUTES NOTES ====================

// CRÉER LA TABLE NOTES SI ELLE N'EXISTE PAS
const createNotesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        etudiant_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        note DECIMAL(4,2) NOT NULL CHECK (note >= 0 AND note <= 20),
        date_evaluation DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(etudiant_id, course_id)
      )
    `);
    console.log('✅ Table notes créée ou déjà existante');
  } catch (error) {
    console.error('❌ Erreur création table notes:', error);
  }
};

// Appeler cette fonction au démarrage
createNotesTable();

// SAUVEGARDER LES NOTES (en lot)
app.post('/api/notes/bulk', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { notes } = req.body;
    console.log('📝 Sauvegarde notes en lot:', notes);

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune note à sauvegarder'
      });
    }

    await client.query('BEGIN');

    // Pour chaque note, vérifier que le cours appartient au professeur
    for (const noteData of notes) {
      const courseCheck = await client.query(
        'SELECT professeur_id FROM courses WHERE id = $1',
        [noteData.course_id]
      );

      if (courseCheck.rows.length === 0 || courseCheck.rows[0].professeur_id !== req.user.id) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à un des cours'
        });
      }
    }

    // Insérer ou mettre à jour les notes
    const results = [];
    for (const noteData of notes) {
      const result = await client.query(
        `INSERT INTO notes (etudiant_id, course_id, note, date_evaluation) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (etudiant_id, course_id) 
         DO UPDATE SET note = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [noteData.etudiant_id, noteData.course_id, noteData.note, noteData.date_evaluation || new Date()]
      );
      results.push(result.rows[0]);
    }

    await client.query('COMMIT');

    console.log('✅ Notes sauvegardées:', results.length);

    res.json({
      success: true,
      message: `${results.length} note(s) sauvegardée(s) avec succès`,
      notes: results
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Erreur sauvegarde notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la sauvegarde des notes'
    });
  } finally {
    client.release();
  }
});

// RÉCUPÉRER LES NOTES D'UN COURS
app.get('/api/courses/:id/notes', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('📡 Récupération notes pour cours:', courseId);

    // Vérifier que le cours appartient au professeur
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND professeur_id = $2',
      [courseId, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé ou accès non autorisé'
      });
    }

    const notes = await pool.query(
      `SELECT n.*, u.nom as etudiant_nom, u.email as etudiant_email
       FROM notes n
       JOIN users u ON n.etudiant_id = u.id
       WHERE n.course_id = $1
       ORDER BY u.nom ASC`,
      [courseId]
    );

    console.log('📊 Notes récupérées:', notes.rows.length);

    res.json({
      success: true,
      notes: notes.rows
    });

  } catch (error) {
    console.error('💥 Erreur récupération notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notes'
    });
  }
});

// RÉCUPÉRER LES NOTES D'UN ÉTUDIANT
app.get('/api/etudiants/:id/notes', auth, async (req, res) => {
  try {
    const etudiantId = req.params.id;
    console.log('📡 Récupération notes pour étudiant:', etudiantId);

    const notes = await pool.query(
      `SELECT n.*, c.title as course_title, c.level as course_level
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       WHERE n.etudiant_id = $1 AND c.professeur_id = $2
       ORDER BY c.title ASC`,
      [etudiantId, req.user.id]
    );

    res.json({
      success: true,
      notes: notes.rows
    });

  } catch (error) {
    console.error('💥 Erreur récupération notes étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// MODIFIER UNE NOTE
app.put('/api/notes/:id', auth, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { note } = req.body;
    console.log('✏️ Modification note ID:', noteId, 'Nouvelle note:', note);

    // Vérifier que la note appartient à un cours du professeur
    const noteCheck = await pool.query(
      `SELECT n.id 
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       WHERE n.id = $1 AND c.professeur_id = $2`,
      [noteId, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée ou accès non autorisé'
      });
    }

    // Mettre à jour la note
    const result = await pool.query(
      `UPDATE notes 
       SET note = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [note, noteId]
    );

    console.log('✅ Note modifiée:', result.rows[0]);

    res.json({
      success: true,
      message: 'Note modifiée avec succès',
      note: result.rows[0]
    });

  } catch (error) {
    console.error('💥 Erreur modification note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification de la note'
    });
  }
});

// SUPPRIMER UNE NOTE
app.delete('/api/notes/:id', auth, async (req, res) => {
  try {
    const noteId = req.params.id;
    console.log('🗑️ Suppression note ID:', noteId);

    // Vérifier que la note appartient à un cours du professeur
    const noteCheck = await pool.query(
      `SELECT n.id 
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       WHERE n.id = $1 AND c.professeur_id = $2`,
      [noteId, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée ou accès non autorisé'
      });
    }

    // Supprimer la note
    await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);

    console.log('✅ Note supprimée:', noteId);

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur suppression note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la note'
    });
  }
});

// STATISTIQUES DES NOTES
app.get('/api/courses/:id/notes/stats', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('📊 Statistiques notes pour cours:', courseId);

    // Vérifier que le cours appartient au professeur
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND professeur_id = $2',
      [courseId, req.user.id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé ou accès non autorisé'
      });
    }

    const stats = await pool.query(
      `SELECT 
         COUNT(*) as total_notes,
         AVG(note) as moyenne_generale,
         MIN(note) as note_min,
         MAX(note) as note_max,
         COUNT(CASE WHEN note >= 10 THEN 1 END) as admis,
         COUNT(CASE WHEN note < 10 THEN 1 END) as non_admis
       FROM notes 
       WHERE course_id = $1`,
      [courseId]
    );

    const statsData = stats.rows[0];
    const tauxReussite = statsData.total_notes > 0 
      ? Math.round((statsData.admis / statsData.total_notes) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        ...statsData,
        taux_reussite: tauxReussite,
        moyenne_generale: statsData.moyenne_generale ? parseFloat(statsData.moyenne_generale).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('💥 Erreur statistiques notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul des statistiques'
    });
  }
});
// ==================== ROUTES NOTES ÉTUDIANT ====================

// RÉCUPÉRER LES NOTES DE L'ÉTUDIANT CONNECTÉ
app.get('/api/student/grades', auth, requireStudent, async (req, res) => {
  try {
    console.log('📊 Récupération notes pour étudiant:', req.user.id);
    
    const notes = await pool.query(
      `SELECT 
        n.id,
        n.note,
        n.date_evaluation,
        c.title as course_title,
        c.level as course_level,
        prof.nom as professeur_nom,
        cl.name as class_name
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       JOIN users prof ON c.professeur_id = prof.id
       JOIN classes cl ON c.class_id = cl.id
       WHERE n.etudiant_id = $1
       ORDER BY n.date_evaluation DESC, c.title ASC`,
      [req.user.id]
    );

    console.log(`📝 ${notes.rows.length} notes trouvées pour l'étudiant ${req.user.id}`);

    res.json({
      success: true,
      grades: notes.rows,
      count: notes.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération notes étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notes'
    });
  }
});

// ALIAS POUR COMPATIBILITÉ
app.get('/api/notes/etudiant', auth, requireStudent, async (req, res) => {
  try {
    console.log('📊 Récupération notes via alias pour étudiant:', req.user.id);
    
    const notes = await pool.query(
      `SELECT 
        n.id,
        n.note,
        n.date_evaluation,
        c.title as course_title,
        c.level as course_level,
        prof.nom as professeur_nom,
        cl.name as class_name
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       JOIN users prof ON c.professeur_id = prof.id
       JOIN classes cl ON c.class_id = cl.id
       WHERE n.etudiant_id = $1
       ORDER BY n.date_evaluation DESC, c.title ASC`,
      [req.user.id]
    );

    console.log(`📝 ${notes.rows.length} notes trouvées via alias`);

    res.json({
      success: true,
      notes: notes.rows,
      count: notes.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération notes étudiant (alias):', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notes'
    });
  }
});

// RÉCUPÉRER LES NOTES D'UN ÉTUDIANT SPÉCIFIQUE (POUR PROFESSEURS)
app.get('/api/students/:id/grades', auth, requireTeacher, async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log('📊 Récupération notes pour étudiant:', studentId, 'par professeur:', req.user.id);

    // Vérifier que l'étudiant est dans une classe du professeur
    const studentCheck = await pool.query(
      `SELECT u.id 
       FROM users u
       JOIN classes c ON u.class_id = c.id 
       WHERE u.id = $1 AND c.professeur_id = $2`,
      [studentId, req.user.id]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cet étudiant'
      });
    }

    const notes = await pool.query(
      `SELECT 
        n.id,
        n.note,
        n.date_evaluation,
        c.title as course_title,
        c.level as course_level
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       WHERE n.etudiant_id = $1 AND c.professeur_id = $2
       ORDER BY n.date_evaluation DESC, c.title ASC`,
      [studentId, req.user.id]
    );

    res.json({
      success: true,
      grades: notes.rows,
      count: notes.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération notes étudiant spécifique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notes'
    });
  }
});

// ==================== ROUTES DEVOIRS ÉTUDIANT ====================

// RÉCUPÉRER LES DEVOIRS DE L'ÉTUDIANT CONNECTÉ
app.get('/api/student/assignments', auth, requireStudent, async (req, res) => {
  try {
    console.log('📋 Récupération devoirs pour étudiant:', req.user.id);
    
    const devoirs = await pool.query(
      `SELECT 
        d.id,
        d.title,
        d.description,
        d.date_limite,
        d.fichier,
        d.statut,
        d.created_at,
        c.title as course_title,
        cl.name as class_name,
        prof.nom as professeur_nom
       FROM devoirs d
       JOIN courses c ON d.course_id = c.id
       JOIN classes cl ON d.class_id = cl.id
       JOIN users prof ON d.professeur_id = prof.id
       WHERE cl.id = (SELECT class_id FROM users WHERE id = $1)
       ORDER BY d.date_limite ASC, d.created_at DESC`,
      [req.user.id]
    );

    console.log(`📚 ${devoirs.rows.length} devoirs trouvés pour l'étudiant`);

    res.json({
      success: true,
      assignments: devoirs.rows,
      count: devoirs.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération devoirs étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des devoirs'
    });
  }
});

// ALIAS POUR COMPATIBILITÉ
app.get('/api/devoirs/etudiant', auth, requireStudent, async (req, res) => {
  try {
    console.log('📋 Récupération devoirs via alias pour étudiant:', req.user.id);
    
    const devoirs = await pool.query(
      `SELECT 
        d.id,
        d.title,
        d.description,
        d.date_limite,
        d.fichier,
        d.statut,
        d.created_at,
        c.title as course_title,
        cl.name as class_name,
        prof.nom as professeur_nom
       FROM devoirs d
       JOIN courses c ON d.course_id = c.id
       JOIN classes cl ON d.class_id = cl.id
       JOIN users prof ON d.professeur_id = prof.id
       WHERE cl.id = (SELECT class_id FROM users WHERE id = $1)
       ORDER BY d.date_limite ASC, d.created_at DESC`,
      [req.user.id]
    );

    console.log(`📚 ${devoirs.rows.length} devoirs trouvés via alias`);

    res.json({
      success: true,
      devoirs: devoirs.rows,
      count: devoirs.rows.length
    });

  } catch (error) {
    console.error('💥 Erreur récupération devoirs étudiant (alias):', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des devoirs'
    });
  }
});
// ==================== ROUTES UTILITAIRES ====================

// ROUTE POUR VOIR TOUS LES UTILISATEURS
app.get('/api/users', async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, nom, email, role, class_id FROM users ORDER BY id DESC'
    );
    
    console.log('📊 Utilisateurs dans PostgreSQL:', users.rows.length);

    res.json({ 
      success: true, 
      count: users.rows.length, 
      users: users.rows 
    });
  } catch (error) {
    console.error('💥 Erreur récupération users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// ROUTE DE TEST
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      success: true, 
      message: 'Backend fonctionne avec PostgreSQL', 
      time: result.rows[0].time 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur DB', 
      error: error.message 
    });
  }
});

// ==================== GESTION DES ERREURS ====================

// Gestion des erreurs Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 10MB)'
      });
    }
  }
  if (error.message === 'Type de fichier non autorisé') {
    return res.status(400).json({
      success: false,
      message: 'Type de fichier non autorisé'
    });
  }
  next(error);
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée: ' + req.originalUrl
  });
});

// ==================== DÉMARRAGE DU SERVEUR ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log('📊 Base de données: PostgreSQL');
  console.log('🔐 Routes disponibles:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/profile');
  console.log('   POST /api/classes/create');
  console.log('   GET  /api/classes/professeur');
  console.log('   GET  /api/classes');
  console.log('   POST /api/courses/create (avec fichier)');
  console.log('   GET  /api/courses/professeur');
  console.log('   POST /api/devoirs/create (avec fichier)');
  console.log('   GET  /api/devoirs/professeur');
  console.log('   GET  /api/users');
  console.log('\n🎓 Routes étudiant activées:');
  console.log('   GET  /api/student/dashboard');
  console.log('   GET  /api/student/courses');
  console.log('   GET  /api/student/profile');
  console.log('   PUT  /api/student/profile');
  console.log('   GET  /api/student/grades');
  console.log('   GET  /api/student/assignments');
  console.log('   GET  /api/notes/etudiant');
  console.log('   GET  /api/devoirs/etudiant');
  console.log('\n👨‍🎓 Routes étudiants:');
  console.log('   GET  /api/students');
  console.log('   GET  /api/etudiants');
  console.log('   GET  /api/courses/:id/students');
  console.log('\n📝 Routes notes:');
  console.log('   POST /api/notes/bulk');
  console.log('   GET  /api/courses/:id/notes');
  console.log('   GET  /api/students/:id/grades');
});