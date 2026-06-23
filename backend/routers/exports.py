import csv
import io
import json
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, Document, Extraction
from dependencies import get_current_user

router = APIRouter(prefix="/api/extractions/export", tags=["exports"])

_CSV_STANDARD = ["vendor_name", "invoice_number", "invoice_date", "amount", "currency", "category", "description"]
_CSV_DETAILED = ["id", "document_id"] + _CSV_STANDARD + ["extracted_at"]


def _query_extractions(current_user: User, db: Session, category: str | None):
    q = (
        db.query(Extraction)
        .join(Document)
        .filter(Document.user_id == current_user.id)
    )
    if category:
        q = q.filter(Extraction.category == category)
    return q.order_by(Extraction.extracted_at.desc()).all()


@router.get("/csv")
async def export_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: str = None,
    format: str = "standard",
):
    """Download all extractions as a CSV file. Use ?format=detailed for extra columns."""
    extractions = _query_extractions(current_user, db, category)
    print(f"CSV export: {len(extractions)} rows for user {current_user.id}")

    fieldnames = _CSV_DETAILED if format == "detailed" else _CSV_STANDARD
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for e in extractions:
        writer.writerow({
            "id": e.id,
            "document_id": e.document_id,
            "vendor_name": e.vendor_name,
            "invoice_number": e.invoice_number,
            "invoice_date": e.invoice_date,
            "amount": e.amount,
            "currency": e.currency,
            "category": e.category,
            "description": e.description,
            "extracted_at": e.extracted_at,
        })

    output.seek(0)
    stem = f"invoices_{category}" if category else "invoices"
    filename = f"{stem}_{current_user.id}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/json")
async def export_json(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: str = None,
):
    """Download all extractions as a JSON file."""
    extractions = _query_extractions(current_user, db, category)
    print(f"JSON export: {len(extractions)} items for user {current_user.id}")

    payload = {
        "user_id": current_user.id,
        "export_date": datetime.utcnow().isoformat(),
        "count": len(extractions),
        "total_amount": round(sum(e.amount for e in extractions if e.amount), 2),
        "extractions": [
            {
                "id": e.id,
                "document_id": e.document_id,
                "vendor_name": e.vendor_name,
                "invoice_number": e.invoice_number,
                "invoice_date": e.invoice_date,
                "amount": e.amount,
                "currency": e.currency,
                "category": e.category,
                "description": e.description,
                "extracted_at": e.extracted_at.isoformat() if e.extracted_at else None,
            }
            for e in extractions
        ],
    }

    stem = f"invoices_{category}" if category else "invoices"
    filename = f"{stem}_{current_user.id}.json"

    return StreamingResponse(
        iter([json.dumps(payload, indent=2)]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
