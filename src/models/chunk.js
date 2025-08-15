const pool = require('../config/db');

async function saveChunk(documentId, chunkIndex, content, embedding) {
  await pool.query(
    'INSERT INTO chunks (document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4)',
    [documentId, chunkIndex, content, JSON.stringify(embedding)]
  );
}

async function getChunksBydocumentId(documentId) {
  const res = await pool.query('SELECT * FROM chunks WHERE document_id = $1 ORDER BY chunk_index', [documentId]);
  return res.rows;
}

async function getAllChunks() {
  const res = await pool.query('SELECT * FROM chunks');
  return res.rows;
}

module.exports = { saveChunk, getChunksBydocumentId, getAllChunks }; 