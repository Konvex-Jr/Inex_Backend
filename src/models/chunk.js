const pool = require('../config/db');

async function createChunksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      chunk_index INTEGER,
      text TEXT,
      embedding JSONB
    )
  `);
}

async function saveChunk(documentId, chunkIndex, content, embedding) {
  await createChunksTable();
  await pool.query(
    'INSERT INTO chunks (document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4)',
    [documentId, chunkIndex, content, JSON.stringify(embedding)]
  );
}

async function getChunksBydocumentId(documentId) {
  await createChunksTable();
  const res = await pool.query('SELECT * FROM chunks WHERE document_id = $1 ORDER BY chunk_index', [documentId]);
  return res.rows;
}

async function getAllChunks() {
  await createChunksTable();
  const res = await pool.query('SELECT * FROM chunks');
  return res.rows;
}

module.exports = { saveChunk, getChunksBydocumentId, getAllChunks }; 