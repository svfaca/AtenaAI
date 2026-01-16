"""
Configurações centralizadas da aplicação.
"""
import os
from pathlib import Path

# Diretórios
BASE_DIR = Path(__file__).parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

# Carregar .env aqui também como fallback
if ENV_FILE.exists():
    with open(ENV_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                if key.strip() not in os.environ:
                    os.environ[key.strip()] = value.strip()

# Modelos e limites
AI_MODEL = "gpt-4o-mini"
MAX_INPUT_LENGTH = 500
MAX_MESSAGE_HISTORY = 10

# OpenAI - Usar valor de os.environ (já carregado do .env)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# CORS
CORS_ORIGINS = ["*"]  # ⚠️ Em produção, restringir a domínios específicos

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# API
API_VERSION = "1.0.0"
