from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import DATABASE_URL, ENVIRONMENT
from database import init_db
from routers.auth import router as auth_router
from routers.documents import router as documents_router
from routers.extractions import router as extractions_router

print(f"Starting InvoiceAI Pro in {ENVIRONMENT} mode...")
print(f"Database: {DATABASE_URL[:60]}...")

app = FastAPI(title="InvoiceAI Pro API")


@app.on_event("startup")
def startup():
    try:
        init_db()
        print("All systems ready!")
    except Exception as e:
        print(f"Startup error: {e}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(extractions_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "InvoiceAI Pro Backend is running"}


@app.get("/")
async def root():
    return {"message": "Welcome to InvoiceAI Pro API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
