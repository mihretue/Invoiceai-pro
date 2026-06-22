from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Document, Extraction
from schemas import ExtractionResponse, ExtractionUpdate
from dependencies import get_current_user
from models import User

router = APIRouter(prefix="/api/extractions", tags=["extractions"])

VALID_CATEGORIES = {"Meals", "Supplies", "Software", "Travel", "Equipment", "Other"}


def _owned_extraction(extraction_id: int, current_user: User, db: Session):
    """Return extraction if it belongs to current_user, else raise 404."""
    extraction = (
        db.query(Extraction)
        .join(Document)
        .filter(Extraction.id == extraction_id, Document.user_id == current_user.id)
        .first()
    )
    if not extraction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction not found")
    return extraction


# ===== STATIC ROUTES (must come before /{extraction_id}) =====

@router.get("/search")
async def search_extractions(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
):
    """Search by vendor name, invoice number, or description."""
    if len(q) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters",
        )

    term = f"%{q}%"
    extractions = (
        db.query(Extraction)
        .join(Document)
        .filter(
            Document.user_id == current_user.id,
            (
                Extraction.vendor_name.ilike(term)
                | Extraction.invoice_number.ilike(term)
                | Extraction.description.ilike(term)
            ),
        )
        .order_by(Extraction.extracted_at.desc())
        .limit(min(limit, 100))
        .all()
    )

    print(f"Search '{q}': {len(extractions)} results")
    return {"query": q, "count": len(extractions), "extractions": extractions}


@router.get("/filter/category/{category}")
async def get_by_category(
    category: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
):
    """List extractions in a category with totals."""
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Valid: {', '.join(sorted(VALID_CATEGORIES))}",
        )

    extractions = (
        db.query(Extraction)
        .join(Document)
        .filter(Document.user_id == current_user.id, Extraction.category == category)
        .order_by(Extraction.extracted_at.desc())
        .limit(min(limit, 100))
        .all()
    )

    total_amount = round(sum(e.amount for e in extractions if e.amount), 2)
    print(f"Category '{category}': {len(extractions)} items, total ${total_amount}")

    return {
        "category": category,
        "count": len(extractions),
        "total_amount": total_amount,
        "currency": "USD",
        "extractions": extractions,
    }


@router.get("/filter/vendor/{vendor}")
async def get_by_vendor(
    vendor: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
):
    """List extractions for a vendor with totals."""
    extractions = (
        db.query(Extraction)
        .join(Document)
        .filter(
            Document.user_id == current_user.id,
            Extraction.vendor_name.ilike(f"%{vendor}%"),
        )
        .order_by(Extraction.extracted_at.desc())
        .limit(min(limit, 100))
        .all()
    )

    if not extractions:
        return {"vendor": vendor, "count": 0, "total_amount": 0, "last_invoice_date": None, "extractions": []}

    total_amount = round(sum(e.amount for e in extractions if e.amount), 2)
    print(f"Vendor '{vendor}': {len(extractions)} invoices, total ${total_amount}")

    return {
        "vendor": vendor,
        "count": len(extractions),
        "total_amount": total_amount,
        "last_invoice_date": extractions[0].invoice_date,
        "extractions": extractions,
    }


# ===== LIST =====

@router.get("", response_model=list[ExtractionResponse])
async def list_extractions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: str = None,
    vendor: str = None,
    skip: int = 0,
    limit: int = 50,
):
    """List all extractions for the current user with optional filters and pagination."""
    query = (
        db.query(Extraction)
        .join(Document)
        .filter(Document.user_id == current_user.id)
    )

    if category:
        query = query.filter(Extraction.category == category)
    if vendor:
        query = query.filter(Extraction.vendor_name.ilike(f"%{vendor}%"))

    total = query.count()
    limit = max(1, min(limit, 100))
    skip = max(0, skip)

    extractions = (
        query.order_by(Extraction.extracted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    print(f"List extractions: {len(extractions)}/{total} for user {current_user.id}")
    return extractions


# ===== SINGLE CRUD (dynamic routes last) =====

@router.get("/{extraction_id}", response_model=ExtractionResponse)
async def get_extraction(
    extraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _owned_extraction(extraction_id, current_user, db)


@router.put("/{extraction_id}", response_model=ExtractionResponse)
async def update_extraction(
    extraction_id: int,
    update_data: ExtractionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extraction = _owned_extraction(extraction_id, current_user, db)

    changes = update_data.model_dump(exclude_unset=True)
    for key, value in changes.items():
        if value is not None:
            setattr(extraction, key, value)

    db.commit()
    db.refresh(extraction)
    print(f"Extraction {extraction_id} updated: {list(changes.keys())}")
    return extraction


@router.delete("/{extraction_id}")
async def delete_extraction(
    extraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extraction = _owned_extraction(extraction_id, current_user, db)

    db.delete(extraction)
    db.commit()
    print(f"Extraction {extraction_id} deleted")
    return {"message": "Extraction deleted successfully", "deleted_id": extraction_id}
