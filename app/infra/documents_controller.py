import numpy as np
from psycopg2.extensions import register_adapter, AsIs

def adapt_numpy_array(arr):
    return AsIs("ARRAY" + str(list(arr)))

register_adapter(np.ndarray, adapt_numpy_array)

class DocumentsController:
    def __init__(self, db_connection):
        self.db = db_connection
        self.documents = []
        self._load_documents_from_db()

    def _load_documents_from_db(self):
        self.db.cur.execute("SELECT id, content, embedding FROM documents")
        rows = self.db.cur.fetchall()
        for doc_id, content, embedding in rows:
            embedding_array = np.array(embedding, dtype=np.float64)
            self.documents.append((doc_id, content, embedding_array))

    def add_document(self, content: str, embedding: np.ndarray) -> int:
        self.db.cur.execute(
            "INSERT INTO documents (content, embedding) VALUES (%s, %s) RETURNING id",
            (content, embedding.tolist())
        )
        doc_id = self.db.cur.fetchone()[0]
        self.documents.append((doc_id, content, embedding))
        return doc_id

    def reset(self):
        self.db.cur.execute("DELETE FROM documents")
        self.documents.clear()

    def search(self, query_embedding: np.ndarray, top_k=2):
        if not self.documents:
            return []

        def cosine_similarity(vec1, vec2):
            return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

        similarities = [
            (doc_id, content, cosine_similarity(embedding, query_embedding))
            for doc_id, content, embedding in self.documents
        ]

        sorted_by_score = sorted(similarities, key=lambda x: x[2], reverse=True)
        return [content for _, content, _ in sorted_by_score[:top_k]]
