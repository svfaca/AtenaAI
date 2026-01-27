from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# ==============================================================================
# 🛑 CORTE DE SEGURANÇA (HARDCODE)
# Aqui nós ignoramos o os.getenv e FORÇAMOS o uso do SQLite.
# Isso impede fisicamente que o código conecte no Render.
# ==============================================================================
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

print("\n" + "="*60)
print(f"🏠 MODO LOCAL FORÇADO: Usando {SQLALCHEMY_DATABASE_URL}")
print("="*60 + "\n")

# Configurações do motor (engine) para SQLite
connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)

# Sessão do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os Models
Base = declarative_base()

# Dependência para injetar o banco nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
