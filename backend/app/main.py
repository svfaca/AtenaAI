import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import CORS_ORIGINS, API_VERSION
from app.database.database import Base, engine

Base.metadata.create_all(bind=engine)

# ===== ROUTERS =====
from app.routes.chat import router as chat_router
from app.routes.conversations import router as conversations_router
from app.routes.auth import router as auth_router

# =========================
# LOGGING
# =========================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================
# APP INITIALIZATION
# =========================
app = FastAPI(
    title="AtenaAI API",
    description="API de chat com integração de IA",
    version=API_VERSION
)

# =========================
# MIDDLEWARE (CORS)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATABASE
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# ROUTERS
# =========================
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversations_router)

# =========================
# STATIC FILES
# =========================
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# =========================
# HEALTH CHECKS
# =========================
@app.get("/")
async def root():
    return {"status": "ok", "message": "AtenaAI API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
