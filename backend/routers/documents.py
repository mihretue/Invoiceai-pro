from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import User, Document, Extraction
from schemas import DocumentResponse
from services.s3_service import upload_file, delete_file
from dependencies import get_current_user
from celery_app import extract_invoice as queue_extraction

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg", "application/pdf"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=dict)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Allowed types: PNG, JPG, PDF",
        )

    file_content = await file.read()

    if len(file_content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: 10MB. Your file: {len(file_content) / 1024 / 1024:.2f}MB",
        )

    try:
        s3_key = upload_file(file_content, file.filename, file.content_type)
        document = Document(
            user_id=current_user.id,
            filename=file.filename,
            s3_key=s3_key,
            status="processing",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        print(f"Document saved with ID: {document.id}")

        task = queue_extraction.delay(document.id, s3_key)
        print(f"Queued extraction task: {task.id}")

        return {
            "document_id": document.id,
            "filename": document.filename,
            "status": "processing",
            "message": "Document uploaded and queued for processing.",
            "task_id": task.id,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload error: {str(e)}",
        )


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.upload_date.desc())
        .all()
    )
    print(f"Found {len(documents)} documents for user {current_user.id}")
    return documents


@router.get("/{document_id}", response_model=dict)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    extractions = db.query(Extraction).filter(Extraction.document_id == document_id).all()
    return {"document": document, "extractions": extractions}


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    try:
        delete_file(document.s3_key)
        db.query(Extraction).filter(Extraction.document_id == document_id).delete()
        db.delete(document)
        db.commit()
        print(f"Document {document_id} deleted successfully")
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete error: {str(e)}",
        )
