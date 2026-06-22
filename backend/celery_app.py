from celery import Celery
from celery.utils.log import get_task_logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL, REDIS_URL

celery_app = Celery("invoiceai", broker=REDIS_URL, backend=REDIS_URL)

logger = get_task_logger(__name__)

_engine = create_engine(DATABASE_URL)
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def extract_invoice(self, document_id: int, s3_key: str):
    """Download document from S3, run Claude Vision extraction, save results to DB."""
    db = _SessionLocal()
    try:
        from models import Document, Extraction
        from services.s3_service import get_signed_url
        from services.extraction_service import process_invoice
        import asyncio
        import tempfile
        import urllib.request
        import os

        logger.info(f"Starting extraction for document {document_id}")

        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found")
            return

        try:
            signed_url = get_signed_url(s3_key, expires_in=3600)

            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                urllib.request.urlretrieve(signed_url, tmp.name)
                temp_path = tmp.name

            logger.info(f"Downloaded to: {temp_path}")

            extracted_data = asyncio.run(process_invoice(temp_path))

            extraction = Extraction(
                document_id=document_id,
                vendor_name=extracted_data.get("vendor_name", ""),
                invoice_number=extracted_data.get("invoice_number", ""),
                invoice_date=extracted_data.get("invoice_date", ""),
                amount=float(extracted_data.get("amount", 0)),
                currency=extracted_data.get("currency", "USD"),
                category=extracted_data.get("category", "Other"),
                description=extracted_data.get("description", ""),
                raw_data=str(extracted_data),
            )
            db.add(extraction)
            document.status = "completed"
            db.commit()

            os.unlink(temp_path)
            logger.info(f"Extraction complete for document {document_id}")

        except Exception as e:
            logger.error(f"Extraction failed for document {document_id}: {e}")
            document.status = "failed"
            db.commit()
            raise self.retry(exc=e, countdown=2 ** self.request.retries)

    finally:
        db.close()


@celery_app.task
def test_celery():
    """Smoke-test task to verify Celery is running."""
    logger.info("Celery test task executed")
    return "Celery is working"
