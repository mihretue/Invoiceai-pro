from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

print(f"[DB] Connecting to: {DATABASE_URL[:60]}...")

# Create engine
try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )
    print("[OK] Database engine created")
except Exception as e:
    print(f"[ERR] Database error: {e}")
    raise

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables
def init_db():
    from models import Base
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created")
    except Exception as e:
        print(f"[ERR] Table creation error: {e}")
        raise