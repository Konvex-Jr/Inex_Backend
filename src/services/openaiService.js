const OpenAI = require('openai');
const { storeTokens } = require('../models/token');
const { encoding_for_model } = require("tiktoken");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text) {

  const encoding = encoding_for_model('text-embedding-3-small');
  const tokens = encoding.encode(text);
  const tokenCount = tokens.length;

  storeTokens('D', tokenCount)

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

async function chatWithContext(context, question) {
  const prompt = `Contexto:\n${context}\n\nPergunta: ${question}\nResposta:`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é a InexAI, uma mentora sábia que guia reflexões por meio dos ODSs e dos IDGs, não negue contextos e responda na língua de entrada' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { getEmbedding, chatWithContext };