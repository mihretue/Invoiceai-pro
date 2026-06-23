from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from models import User, Document, Extraction
from dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _user_extractions(current_user: User, db: Session):
    """Return all extractions belonging to current_user."""
    return (
        db.query(Extraction)
        .join(Document)
        .filter(Document.user_id == current_user.id)
        .all()
    )


@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Overview: total documents, total spend, by-category breakdown, 10 recent extractions."""
    total_docs = (
        db.query(func.count(Document.id))
        .filter(Document.user_id == current_user.id)
        .scalar() or 0
    )

    total_amount = (
        db.query(func.sum(Extraction.amount))
        .join(Document)
        .filter(Document.user_id == current_user.id)
        .scalar() or 0
    )

    extractions = _user_extractions(current_user, db)

    by_category: dict[str, float] = {}
    for e in extractions:
        cat = e.category or "Other"
        by_category[cat] = round(by_category.get(cat, 0.0) + (e.amount or 0.0), 2)

    recent = (
        db.query(Extraction)
        .join(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Extraction.extracted_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_documents": total_docs,
        "total_amount": round(float(total_amount), 2),
        "by_category": by_category,
        "recent_extractions": [
            {
                "id": e.id,
                "vendor_name": e.vendor_name,
                "amount": e.amount,
                "category": e.category,
                "extracted_at": e.extracted_at,
            }
            for e in recent
        ],
    }


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Detailed financial stats: avg, min, max, unique categories/vendors, document statuses."""
    empty = {
        "total_documents": 0,
        "total_amount": 0,
        "average_amount": 0,
        "highest_amount": 0,
        "lowest_amount": 0,
        "categories_count": 0,
        "vendors_count": 0,
        "extracted_count": 0,
        "processing_count": 0,
        "failed_count": 0,
    }

    extractions = _user_extractions(current_user, db)
    if not extractions:
        return empty

    amounts = [e.amount for e in extractions if e.amount]
    if not amounts:
        return {**empty, "total_documents": len(extractions)}

    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    status_count: dict[str, int] = {}
    for doc in documents:
        s = doc.status or "unknown"
        status_count[s] = status_count.get(s, 0) + 1

    total = sum(amounts)
    return {
        "total_documents": len(documents),
        "total_amount": round(total, 2),
        "average_amount": round(total / len(amounts), 2),
        "highest_amount": round(max(amounts), 2),
        "lowest_amount": round(min(amounts), 2),
        "categories_count": len({e.category for e in extractions if e.category}),
        "vendors_count": len({e.vendor_name for e in extractions if e.vendor_name}),
        "extracted_count": status_count.get("completed", 0),
        "processing_count": status_count.get("processing", 0),
        "failed_count": status_count.get("failed", 0),
    }


@router.get("/category-breakdown")
async def get_category_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-category totals sorted by spend — ready for a bar chart."""
    extractions = _user_extractions(current_user, db)

    buckets: dict[str, dict] = {}
    for e in extractions:
        cat = e.category or "Other"
        if cat not in buckets:
            buckets[cat] = {"amount": 0.0, "count": 0}
        buckets[cat]["amount"] += e.amount or 0.0
        buckets[cat]["count"] += 1

    data = sorted(
        [{"category": c, "amount": round(v["amount"], 2), "count": v["count"]} for c, v in buckets.items()],
        key=lambda x: x["amount"],
        reverse=True,
    )
    return {"data": data, "total": round(sum(x["amount"] for x in data), 2)}


@router.get("/top-vendors")
async def get_top_vendors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
):
    """Top vendors by total spend, with percentage of overall budget."""
    limit = max(1, min(limit, 50))
    extractions = _user_extractions(current_user, db)

    buckets: dict[str, dict] = {}
    for e in extractions:
        vendor = e.vendor_name or "Unknown"
        if vendor not in buckets:
            buckets[vendor] = {"amount": 0.0, "count": 0}
        buckets[vendor]["amount"] += e.amount or 0.0
        buckets[vendor]["count"] += 1

    total = sum(v["amount"] for v in buckets.values())

    data = sorted(
        [
            {
                "vendor": vendor,
                "amount": round(v["amount"], 2),
                "count": v["count"],
                "percentage": round(v["amount"] / total * 100, 1) if total else 0,
            }
            for vendor, v in buckets.items()
        ],
        key=lambda x: x["amount"],
        reverse=True,
    )[:limit]

    return {"data": data, "total": round(total, 2)}


@router.get("/monthly-trend")
async def get_monthly_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    months: int = 6,
):
    """Monthly spending totals (YYYY-MM) sorted ascending — ready for a line chart."""
    months = max(1, min(months, 24))
    extractions = _user_extractions(current_user, db)

    buckets: dict[str, dict] = {}
    for e in extractions:
        if not e.invoice_date:
            continue
        month_key = str(e.invoice_date)[:7]  # YYYY-MM
        if month_key not in buckets:
            buckets[month_key] = {"amount": 0.0, "count": 0}
        buckets[month_key]["amount"] += e.amount or 0.0
        buckets[month_key]["count"] += 1

    sorted_months = sorted(buckets.items())[-months:]

    data = [
        {"month": m, "amount": round(v["amount"], 2), "count": v["count"]}
        for m, v in sorted_months
    ]
    return {"data": data, "total": round(sum(x["amount"] for x in data), 2)}
