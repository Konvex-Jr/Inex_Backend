const db = require('./db');

async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      chunk_index INTEGER,
      content TEXT,
      embedding JSONB
    );
  `);
}

module.exports = initDb; 