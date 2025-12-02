import pool from "../db/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register student/prof
export const register = async (req, res) => {
  const { nom, email, password, role, class_id } = req.body;

  if (!nom || !email || !password || !role) {
    return res.status(400).json({ error: "Tous les champs obligatoires sauf class_id" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const classIdValue = class_id || null;

    const result = await pool.query(
      "INSERT INTO users (nom, email, password, role, class_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, email, hashedPassword, role, classIdValue]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe obligatoires" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Email introuvable" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
};
