from sqlalchemy import Column, String, Integer, DateTime, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    s3_key = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="processing")


class Extraction(Base):
    __tablename__ = "extractions"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    vendor_name = Column(String)
    invoice_number = Column(String)
    invoice_date = Column(String)
    amount = Column(Float)
    currency = Column(String, default="USD")
    category = Column(String)
    description = Column(Text)
    extracted_at = Column(DateTime, default=datetime.utcnow)
    raw_data = Column(Text)
