import os
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carrega .env ANTES de qualquer outra coisa
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()
    logger.info(f"✅ .env carregado de {env_path}")
    logger.info(f"✅ OPENAI_API_KEY está {'configurada' if os.getenv('OPENAI_API_KEY') else 'NÃO CONFIGURADA'}")
else:
    logger.warning(f"⚠️  Arquivo .env não encontrado em {env_path}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ===== CONFIG =====
from app.core.config import CORS_ORIGINS

# ===== DATABASE =====
from app.database.database import Base, engine

# ===== ROUTERS =====
from app.routes.chat import router as chat_router
from app.routes.conversations import router as conversations_router
from app.routes.auth import router as auth_router
from app.auth.register import router as register_router
from app.auth.login import router as login_router


# =========================
# APP INITIALIZATION
# =========================
app = FastAPI(
    title="IA Chat API",
    description="API de chat com integração de IA",
    version="1.0.0"
)

# =========================
# MIDDLEWARE
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
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(auth_router)
app.include_router(register_router)
app.include_router(login_router)

# =========================
# STATIC FILES
# =========================
# Servir arquivos da pasta uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "IA Chat API is running"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    api_key = os.getenv("OPENAI_API_KEY")
    return {
        "status": "healthy",
        "openai_configured": bool(api_key),
        "openai_key_preview": f"{api_key[:8]}...{api_key[-4:]}" if api_key else None
    }

