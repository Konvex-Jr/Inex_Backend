const pool = require('../config/db');

async function createChunksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      doc_id INTEGER REFERENCES documents(id),
      chunk_index INTEGER,
      text TEXT,
      embedding JSONB
    )
  `);
}

async function saveChunk(docId, chunkIndex, text, embedding) {
  await createChunksTable();
  await pool.query(
    'INSERT INTO chunks (doc_id, chunk_index, text, embedding) VALUES ($1, $2, $3, $4)',
    [docId, chunkIndex, text, JSON.stringify(embedding)]
  );
}

async function getChunksByDocId(docId) {
  await createChunksTable();
  const res = await pool.query('SELECT * FROM chunks WHERE doc_id = $1 ORDER BY chunk_index', [docId]);
  return res.rows;
}

async function getAllChunks() {
  await createChunksTable();
  const res = await pool.query('SELECT * FROM chunks');
  return res.rows;
}

module.exports = { saveChunk, getChunksByDocId, getAllChunks }; 