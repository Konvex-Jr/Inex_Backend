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
        
        if(req.style):
            style = req.style

        if not self.store.documents:
            return {"answer": "Nenhum documento carregado ainda."}

        query_embedding = self.model.encode([question])[0].astype(np.float32)
        context = self.store.search(query_embedding, top_k=top_k)

        if not context:
            return {"answer": "Nenhum contexto relevante encontrado."}

        prompt = f"Contexto:\n{chr(10).join(context)}\n\nPergunta: {question}\nResposta:"

        if style == "reflexivo":
            content = (
                "Você é a InExIA, uma assistente especializada em formar líderes e gestores com foco nos "
                "Objetivos de Desenvolvimento Sustentável (ODSs) e nos Inner Development Goals (IDGs). "
                "Adote uma abordagem reflexiva: incentive o usuário a pensar criticamente, formular novas perguntas, "
                "e explorar diferentes perspectivas. Promova o autoconhecimento, a consciência sistêmica e a profundidade conceitual, "
                "sem se afastar do contexto apresentado."
            )
        else:
            content = (
                "Você é a InExIA, uma assistente especializada em formar líderes e gestores com foco nos "
                "Objetivos de Desenvolvimento Sustentável (ODSs) e nos Inner Development Goals (IDGs). "
                "Adote uma abordagem generativa: seja assertiva, clara e concisa em suas respostas, com foco em ação, "
                "aprendizado prático e orientação estratégica. Estimule o avanço do usuário em direção ao domínio dos temas."
            )


        response = client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {
                    "role": "system",
                    "content": content
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        return {"answer": response.choices[0].message.content.strip()}
