import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://invoiceai_user:secure_password@localhost:5432/invoiceai"
)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-test")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY", "")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY", "")
AWS_BUCKET = os.getenv("AWS_BUCKET", "invoiceai-bucket")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

print(f"[OK] Environment: {ENVIRONMENT}")
print(f"[OK] Database: {DATABASE_URL[:50]}..." if DATABASE_URL else "[ERR] No database")