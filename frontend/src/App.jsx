import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardProf from './pages/DashboardProf';
import DashboardStudent from './pages/DashboardStudent';
import LandingPage from './pages/LandingPage';
import CreerCours from './pages/CreerCours';
import MesCours from './pages/MesCours';
import CreerClasse from './pages/CreerClase';
import VoirCours from './pages/VoirCours';
import ModifierCours from './pages/ModifierCours';
import Profil from './pages/Profil';
import ModifierProfil from './pages/ModifierProfil';
import ChangerMotDePasse from './pages/ChangerMotDePasse';
import CreerDevoirs from './pages/CreerDevoirs';
import MesDevoirs from './pages/MesDevoirs';
import Notes from './pages/Notes';
import StudentCourses from './pages/StudentCourses';
import StudentNotes from './pages/StudentNotes';
import StudentAssignments from './pages/StudentAssignments';
import StudentProfile from './pages/StudentProfile';
import CreerStudent from './pages/CreerStudent';
import VoirEtudiant from './pages/VoirEtudiant';
import ModifierEtudiant from './pages/ModifierEtudiant';
import Etudiants from "./pages/Etudiants";
function App() {

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
       <Route path="/dashboard-prof" element={<DashboardProf />} />
       <Route path="/dashboard-student" element={<DashboardStudent />} />
       <Route path="/creer-cours" element={<CreerCours />} />
       <Route path="/mes-cours" element={<MesCours />} />
       <Route path="/creer-classe" element={<CreerClasse />} />
       <Route path="/voir-cours/:id" element={<VoirCours />} />
       <Route path="/modifier-cours/:id" element={<ModifierCours />} />
       <Route path="/profil" element={<Profil />} />
       <Route path="/modifier-profil" element={<ModifierProfil />} />
      <Route path="/changer-mot-de-passe" element={<ChangerMotDePasse />} />
      <Route path="/creer_devoirs" element={<CreerDevoirs />} />
      <Route path="/mes-devoirs" element={<MesDevoirs />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/student-courses" element={<StudentCourses />} />
      <Route path="/student-notes" element={<StudentNotes />} />
      <Route path="/student-assignments" element={<StudentAssignments />} />
      <Route path="/student-profile" element={<StudentProfile />} />
       <Route path="/etudiants" element={<Etudiants />} />
       <Route path="/creer-student" element={<CreerStudent />} />
       <Route path="/etudiants/:id" element={<VoirEtudiant />} />
<Route path="/modifier-student/:id" element={<ModifierEtudiant />} />

      </Routes>
    </Router>
  );
}

export default App;