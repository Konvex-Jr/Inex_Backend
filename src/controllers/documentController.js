const path = require('path');
const fs = require('fs');
const { extractTextFromPDF } = require('../utils/fileLoader');
const { getEmbedding } = require('../services/openaiService');
const { saveDocument, getAllDocuments } = require('../models/document');
const { saveChunk } = require('../models/chunk');

function splitText(text, maxLength = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

async function uploadDocument(req, res) {
  try {
    if (!req.file || !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Apenas PDFs são aceitos.' });
    }
    const documentsDir = path.join(__dirname, '../../documents');
    if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir);
    const filePath = path.join(documentsDir, req.file.originalname);
    fs.writeFileSync(filePath, req.file.buffer);

    const text = await extractTextFromPDF(filePath);
    if (!text.trim()) {
      return res.status(400).json({ error: 'PDF sem texto extraível.' });
    }

    const docId = await saveDocument(req.file.originalname, text);

    const chunks = splitText(text, 1000);
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);
      await saveChunk(docId, i, chunks[i], embedding);
    }

    return res.status(201).json({ id: docId, chunks: chunks.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar o PDF.', details: err.message });
  }
}

async function listDocuments(req, res) {
  try {
    const docs = await getAllDocuments();
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar documentos.' });
  }
}

module.exports = { uploadDocument, listDocuments }; 