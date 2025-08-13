const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function chatWithContext(context, question) {
  const prompt = `Contexto:\n${context}\n\nPergunta: ${question}\nResposta:`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Você é a InExIA, uma assistente...' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { getEmbedding, chatWithContext }; 