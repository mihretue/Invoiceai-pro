from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ===== USER =====

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== DOCUMENT =====

class DocumentResponse(BaseModel):
    id: int
    filename: str
    status: str
    upload_date: datetime

    class Config:
        from_attributes = True


# ===== EXTRACTION =====

class ExtractionCreate(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str
    amount: float
    currency: str = "USD"
    category: str
    description: str

class ExtractionResponse(BaseModel):
    id: int
    document_id: int
    vendor_name: str
    invoice_number: str
    invoice_date: str
    amount: float
    currency: str
    category: str
    description: str
    extracted_at: datetime

    class Config:
        from_attributes = True

class ExtractionUpdate(BaseModel):
    vendor_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None


# ===== DASHBOARD =====

class DashboardSummary(BaseModel):
    total_documents: int
    total_amount: float
    by_category: dict
    recent_extractions: list[ExtractionResponse]
