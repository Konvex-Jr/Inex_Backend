const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const initDb = require('./src/config/initDb');
initDb().then(() => {
  console.log('Banco de dados inicializado!');
}).catch(err => {
  console.error('Erro ao inicializar o banco de dados:', err);
});

const documentRoutes = require('./src/routes/documentRoutes');
const ragRoutes = require('./src/routes/ragRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/documents', documentRoutes);
app.use('/api', ragRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 