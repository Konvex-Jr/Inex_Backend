const pool = require('../config/db');

async function storeTokens(type, amount) {
  await pool.query(
    'INSERT INTO tokens (type, amount) VALUES ($1, $2)',
    [type, amount]
  );
}

module.exports = { storeTokens }; 