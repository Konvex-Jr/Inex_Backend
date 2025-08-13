# Backend Inexia Node (RAG + Embeddings)

## Descrição
Backend simples em Node.js para upload de PDFs, geração de embeddings com OpenAI, armazenamento em PostgreSQL e RAG (Retrieval-Augmented Generation).

## Endpoints
- `POST /api/documents/upload` — Upload de PDF
- `GET /api/documents` — Lista documentos
- `POST /api/ask` — Faz pergunta (RAG)

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com as variáveis do banco e OpenAI.
3. Crie a pasta `documents/` na raiz do projeto.
4. Inicie o servidor:
   ```bash
   npm start
   ```

## Requisitos
- Node.js >= 16
- PostgreSQL
- Chave da OpenAI 