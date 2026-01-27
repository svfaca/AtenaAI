from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False   # ← ESSA LINHA É A CHAVE
)



# =========================
# DATABASE DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# AUTH DEPENDENCY
# =========================
def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    if not token:
        return None

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_from_token = payload.get("sub")
        if user_id_from_token is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception



    # ==========================================================
    # 🛡️ LÓGICA DE BUSCA ROBUSTA (ID ou Email)
    # ==========================================================
    user = None
    
    # 1. Tenta tratar como ID (Inteiro)
    try:
        if user_id_from_token.isdigit(): # Verifica se são apenas números
            user = db.query(User).filter(User.id == int(user_id_from_token)).first()
    except ValueError:
        pass # Não era um número, segue para tentativa por email

    # 2. Se não achou por ID, tenta buscar por Email (Fallback)
    if not user:
        user = db.query(User).filter(User.email == str(user_id_from_token)).first()

    if not user:
        raise credentials_exception

    return user
