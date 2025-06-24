from fastapi import APIRouter, UploadFile, File
from app.models.schemas import DocumentOut, QueryRequest
from app.services.document_service import DocumentService

router = APIRouter()
doc_service = DocumentService()

@router.get("/documents/", response_model=list[DocumentOut])
def get_documents():
    return doc_service.get_all()

@router.post("/upload_pdf/", response_model=list[DocumentOut])
def upload(file: UploadFile = File(...)):
    return doc_service.upload_pdf(file)

@router.post("/reset/")
def reset():
    doc_service.reset()
    return {"message": "Resetado"}

@router.post("/ask/")
def ask_question(req: QueryRequest):
    return doc_service.ask(req)
