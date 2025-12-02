import pool from "../db/connection.js";

// add course (prof only)
export const addCourse = async (req, res) => {
  const { title, description, level, class_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO courses (title, description, level, class_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, level, class_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// view all courses (filter optional)
export const getCourses = async (req, res) => {
  const { class_id, level } = req.query;
  try {
    let query = "SELECT * FROM courses";
    const params = [];

    if (class_id || level) {
      query += " WHERE ";
      const conditions = [];
      if (class_id) { params.push(class_id); conditions.push(`class_id=$${params.length}`); }
      if (level) { params.push(level); conditions.push(`level=$${params.length}`); }
      query += conditions.join(" AND ");
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// view course by id
export const getCourseById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses WHERE id=$1", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// update course (prof only)
export const updateCourse = async (req, res) => {
  const { title, description, level, class_id } = req.body;
  try {
    const result = await pool.query(
      "UPDATE courses SET title=$1, description=$2, level=$3, class_id=$4 WHERE id=$5 RETURNING *",
      [title, description, level, class_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// delete course (prof only)
export const deleteCourse = async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id=$1", [req.params.id]);
    res.json({ msg: "Course supprimé" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
