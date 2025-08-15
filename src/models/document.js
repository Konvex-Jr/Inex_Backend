const pool = require('../config/db');

async function saveDocument(filename, content) {
  const res = await pool.query(
    'INSERT INTO documents (filename, content) VALUES ($1, $2) RETURNING id',
    [filename, content]
  );
  return res.rows[0].id;
}

async function getDocumentById(id) {
  const res = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
  return res.rows[0];
}

async function getAllDocuments() {
  const res = await pool.query('SELECT * FROM documents');
  return res.rows;
}

module.exports = { saveDocument, getDocumentById, getAllDocuments }; 