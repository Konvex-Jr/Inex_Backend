from pydantic import BaseModel

class DocumentIn(BaseModel):
    content: str

class DocumentOut(BaseModel):
    id: int
    content: str

class QueryRequest(BaseModel):
    question: str
    style: str = "generativo"
    top_k: int = 2
