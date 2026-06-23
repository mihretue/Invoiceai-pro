import traceback
from time import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from config import DATABASE_URL, ENVIRONMENT
from database import init_db
from routers.auth import router as auth_router
from routers.documents import router as documents_router
from routers.exports import router as exports_router
from routers.extractions import router as extractions_router
from routers.dashboard import router as dashboard_router

print(f"Starting InvoiceAI Pro in {ENVIRONMENT} mode...")
print(f"Database: {DATABASE_URL[:60]}...")

app = FastAPI(title="InvoiceAI Pro API")

# ===== STARTUP =====

@app.on_event("startup")
def startup():
    try:
        init_db()
        print("All systems ready!")
    except Exception as e:
        print(f"Startup error: {e}")

# ===== EXCEPTION HANDLERS =====

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    print(f"Database error: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred. Please try again.", "error_type": "database_error"},
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "validation_error"},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unexpected error: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred.", "error_type": "internal_error"},
    )

# ===== MIDDLEWARE =====

# GZIP compression for responses > 1 KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS — allow both React (3000) and Vite (5173) dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time()
    try:
        response = await call_next(request)
        ms = (time() - start) * 1000
        code = response.status_code
        symbol = "OK " if code < 400 else "ERR"
        print(f"[{symbol}] {request.method:<6} {request.url.path:<45} {code}  ({ms:.1f}ms)")
        response.headers["X-Process-Time"] = f"{ms:.1f}ms"
        return response
    except Exception as exc:
        ms = (time() - start) * 1000
        print(f"[EXC] {request.method:<6} {request.url.path:<45} ({ms:.1f}ms)  {exc}")
        raise

# ===== ROUTERS =====
# exports must be registered before extractions so /export/... paths
# are resolved before the /{extraction_id} catch-all (even though
# {extraction_id} is typed int, explicit ordering is safer).

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(exports_router)
app.include_router(extractions_router)
app.include_router(dashboard_router)

# ===== HEALTH =====

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "InvoiceAI Pro Backend is running"}

@app.get("/")
async def root():
    return {"message": "Welcome to InvoiceAI Pro API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
