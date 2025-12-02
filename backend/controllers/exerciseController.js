import pool from "../db/connection.js";

// ajouter exercice (prof)
export const addExercise = async (req, res) => {
  const { title, content, class_id, prof_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO exercises (title, content, class_id, prof_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, class_id, prof_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// voir exercises (filtrage possible par classe)
export const getExercises = async (req, res) => {
  const { class_id } = req.query;
  try {
    let query = "SELECT e.*, u.nom AS prof_name FROM exercises e JOIN users u ON e.prof_id = u.id";
    const params = [];
    if (class_id) {
      params.push(class_id);
      query += ` WHERE class_id=$1`;
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// voir exercise par id
export const getExerciseById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exercises WHERE id=$1", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// modifier exercise (prof)
export const updateExercise = async (req, res) => {
  const { title, content, class_id } = req.body;
  try {
    const result = await pool.query(
      "UPDATE exercises SET title=$1, content=$2, class_id=$3 WHERE id=$4 RETURNING *",
      [title, content, class_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// supprimer exercise (prof)
export const deleteExercise = async (req, res) => {
  try {
    await pool.query("DELETE FROM exercises WHERE id=$1", [req.params.id]);
    res.json({ msg: "Exercice supprimé" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
