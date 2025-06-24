import fitz
import numpy as np
from sentence_transformers import SentenceTransformer
from fastapi import UploadFile, HTTPException
from app.core.embedding_model import model
from app.core.openai_client import client
from app.core.config import settings
from app.infra.documents_controller import DocumentsController
from app.infra.database.connection import DatabaseConnection

class DocumentService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.db = DatabaseConnection(
            settings.DB_USER, settings.DB_PASSWORD, settings.DB_NAME,
            settings.DB_HOST, settings.DB_PORT
        )
        self.db.run_sql_file("migrations/001_create_documents_table.sql")
        self.store = DocumentsController(self.db)

    def get_all(self):
        self.db.cur.execute("SELECT id, content FROM documents")
        return [{"id": row[0], "content": row[1]} for row in self.db.cur.fetchall()]

    def upload_pdf(self, file: UploadFile):
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Apenas PDFs")

        content = file.file.read()
        pdf = fitz.open(stream=content, filetype="pdf")
        texts = [p.get_text().strip() for p in pdf if p.get_text().strip()]
        pdf.close()

        if not texts:
            raise HTTPException(status_code=400, detail="PDF vazio")

        result = []
        for chunk in texts:
            embedding = self.model.encode([chunk])[0].astype(np.float32)
            id_ = self.store.add_document(chunk, embedding)
            result.append({"id": id_, "content": chunk})
        return result

    def reset(self):
        self.store.reset()

    def ask(self, req):
        question = req.question
        top_k = req.top_k

        if not self.store.documents:
            return {"answer": "Nenhum documento carregado ainda."}

        query_embedding = self.model.encode([question])[0].astype(np.float32)
        context = self.store.search(query_embedding, top_k=top_k)

        if not context:
            return {"answer": "Nenhum contexto relevante encontrado."}

        prompt = f"Contexto:\n{chr(10).join(context)}\n\nPergunta: {question}\nResposta:"

        response = client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Você é a InExIA, uma assistente dedicada a treinar líderes e gestores de forma reflexiva "
                        "sobre os Objetivos de Desenvolvimento Sustentável (ODSs) e os Inner Development Goals (IDGs). "
                        "Sua missão é facilitar o aprendizado, estimular perguntas profundas, oferecer clareza conceitual, "
                        "exemplos práticos e incentivar a transformação consciente. "
                        "Se o usuário fizer perguntas fora do contexto ou inusitadas, não negue a pergunta. "
                        "Ao invés disso, responda com muita educação e gentileza, guiando-o a refletir sobre como "
                        "o tema pode se relacionar ou contribuir para os ODSs e IDGs. "
                        "Sempre busque assimilar a pergunta dentro desse contexto, promovendo uma autoreflexão construtiva "
                        "que estimule a conexão entre o questionamento e os princípios dos ODSs e IDGs."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300,
        )
        return {"answer": response.choices[0].message.content.strip()}
