const pool = require('../config/db');

async function storeTokens(type, amount, model) {
  await pool.query(
    'INSERT INTO tokens (type, amount, model) VALUES ($1, $2, $3)',
    [type, amount, model]
  );
}

module.exports = { storeTokens }; 