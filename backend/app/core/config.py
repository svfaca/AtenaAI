"""
Configurações centralizadas da aplicação.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# =========================================================
# BASE DIR & ENV LOAD
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

# =========================================================
# API CONFIG
# =========================================================

API_VERSION = "1.0.0"

# =========================================================
# AI CONFIG
# =========================================================

AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
MAX_INPUT_LENGTH = int(os.getenv("MAX_INPUT_LENGTH", 500))
MAX_MESSAGE_HISTORY = int(os.getenv("MAX_MESSAGE_HISTORY", 10))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# =========================================================
# SECURITY CONFIG
# =========================================================

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# =========================================================
# DATABASE CONFIG
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

# =========================================================
# CORS CONFIG
# =========================================================

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
