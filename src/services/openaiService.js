const OpenAI = require('openai');
const { storeTokens } = require('../models/token');
const { encoding_for_model } = require("tiktoken");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text) {

  const model = "text-embedding-3-small";
  
  const encoding = encoding_for_model(model);
  const tokens = encoding.encode(text);
  const tokenCount = tokens.length;

  storeTokens('get-embedding', tokenCount, model);

  const response = await openai.embeddings.create({
    model: model,
    input: text,
  });

  return response.data[0].embedding;
}

async function chatWithContext(context, question) {
  const model = "gpt-4o-mini";
  const encoding = encoding_for_model(model);

  const prompt = `Contexto:\n${context}\n\nPergunta: ${question}\nResposta:`;
  const tokensPrompt = encoding.encode(prompt);
  const inputTokenCount = tokensPrompt.length;

  storeTokens('chat-input', inputTokenCount, model);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é a InexAI, uma mentora sábia que guia reflexões por meio dos ODSs e dos IDGs, não negue contextos e responda na língua de entrada' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const outputTokensCount = response.usage?.completion_tokens || 0;
  storeTokens('chat-output', outputTokensCount, model);

  return response.choices[0].message.content.trim();
}

module.exports = { getEmbedding, chatWithContext };