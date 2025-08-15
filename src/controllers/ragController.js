const { getEmbedding, chatWithContext } = require('../services/openaiService');
const { getAllChunks } = require('../models/chunk');
const pdfParse = require('pdf-parse');

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

async function askQuestion(req, res) {
  try {
    if (!req.file || !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Apenas PDFs são aceitos.' });
    }

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    const { question, top_k = 3 } = req.body;
    if (!question) {
      return res.status(400).json({ answer: 'Pergunta não informada.' });
    }
    const queryEmbedding = await getEmbedding(question);
    const allChunks = await getAllChunks();
    const sims = allChunks.map(chunk => ({
      chunk,
      sim: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));
    sims.sort((a, b) => b.sim - a.sim);
    const topChunks = sims.slice(0, top_k).map(s => s.chunk);
    if (!topChunks.length) {
      return res.json({ answer: 'Nenhum documento carregado ainda.' });
    }
    const context = topChunks.map(c => c.text).join('\n');
    const combinedContext = `${pdfText}\n${context}\n${question}`;
    const answer = await chatWithContext(combinedContext, question);
    return res.json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ answer: 'Erro ao processar a pergunta.', details: err.message });
  }
}

module.exports = { askQuestion };