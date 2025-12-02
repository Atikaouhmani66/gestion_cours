import pool from "../db/connection.js";

// ajouter note (prof)
export const addNote = async (req, res) => {
  const { student_id, course_id, value } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notes (student_id, course_id, value) VALUES ($1, $2, $3) RETURNING *",
      [student_id, course_id, value]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// voir toutes les notes d’un student
export const getNotesByStudent = async (req, res) => {
  const student_id = req.params.studentId;
  try {
    const result = await pool.query(
      `SELECT n.id, n.value, c.title AS course
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       WHERE n.student_id=$1`,
      [student_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// voir notes par course (prof)
export const getNotesByCourse = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    const result = await pool.query(
      `SELECT n.id, n.value, u.nom AS student
       FROM notes n
       JOIN users u ON n.student_id = u.id
       WHERE n.course_id=$1`,
      [course_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// modifier note (prof)
export const updateNote = async (req, res) => {
  const { value } = req.body;
  try {
    const result = await pool.query(
      "UPDATE notes SET value=$1 WHERE id=$2 RETURNING *",
      [value, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// supprimer note (prof)
export const deleteNote = async (req, res) => {
  try {
    await pool.query("DELETE FROM notes WHERE id=$1", [req.params.id]);
    res.json({ msg: "Note supprimée" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
