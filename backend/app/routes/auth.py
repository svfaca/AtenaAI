from fastapi import APIRouter, Depends, Form, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import json
import os

# Importações do projeto
from app.database.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import create_access_token, verify_password, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Auth"])

# URL BASE (Ajuste para localhost quando estiver testando localmente)
BASE_URL = "http://127.0.0.1:8000"
# Para deploy, use: "https://atenaai.onrender.com"

# ============================
# SCHEMAS LOCAIS
# ============================
class EmailCheckRequest(BaseModel):
    email: str

class EmailCheckResponse(BaseModel):
    available: bool
    message: str


# ============================
# 1. ROTA DE REGISTRO (CRIAR CONTA)
# ============================
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Verifica se email já existe
    user_exists = db.query(User).filter(User.email == user.email).first()
    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="Este email já está registrado."
        )

    # Cria novo usuário com senha hash
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        nickname=user.nickname,
        birth_date=user.birth_date,
        gender=user.gender,
        interests=user.interests,
        account_type=user.account_type
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


# ... (mantenha os imports iguais)

# Na ROTA DE LOGIN (Linha 72 aproximadamente):
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Busca usuário pelo email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Verifica senha
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Gera Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # ==========================================================
    # ✅ CORREÇÃO AQUI: Mudamos 'user.email' para 'str(user.id)'
    # Isso resolve o erro de conversão de INT no backend.
    # ==========================================================
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# ... (restante do código igual)


# ============================
# 3. VERIFICAR EMAIL
# ============================
@router.post("/check-email", response_model=EmailCheckResponse)
def check_email(data: EmailCheckRequest, db: Session = Depends(get_db)):
    """Verifica se um email já está registrado"""
    existing_user = db.query(User).filter(User.email == data.email).first()
    
    if existing_user:
        return {"available": False, "message": "Este email já está registrado."}
    
    return {"available": True, "message": "Email disponível!"}


# ============================
# 4. PEGAR DADOS DO USUÁRIO (ME)
# ============================
@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário logado"""
    return current_user


# ============================
# 5. ATUALIZAR PERFIL (COM FOTO)
# ============================
@router.put("/update-profile", response_model=UserResponse)
def update_profile(
    full_name: Optional[str] = Form(None),
    nickname: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    birth_date: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    account_type: Optional[str] = Form(None),
    interests: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o perfil do usuário logado"""
    
    # Merge do usuário para a nova sessão
    user = db.merge(current_user)
    
    # Atualizar campos básicos
    if full_name and full_name.strip(): user.full_name = full_name.strip()
    if nickname and nickname.strip(): user.nickname = nickname.strip()
    if email and email.strip(): user.email = email.strip()
    if gender and gender.strip(): user.gender = gender.strip()
    if account_type and account_type.strip(): user.account_type = account_type.strip()

    # Data de Nascimento
    if birth_date and birth_date.strip():
        try:
            user.birth_date = datetime.strptime(birth_date.strip(), '%Y-%m-%d').date()
        except ValueError:
            print(f"Erro ao parsear data: {birth_date}")

    # Interesses (JSON)
    if interests:
        try:
            json.loads(interests) # Apenas valida
            user.interests = interests
        except json.JSONDecodeError:
            user.interests = interests # Salva como string se falhar
    
    # Imagem de Perfil
    if profile_image and profile_image.filename:
        try:
            os.makedirs("uploads", exist_ok=True)
            
            # Salva arquivo
            file_extension = os.path.splitext(profile_image.filename)[1]
            file_name = f"{user.id}_{int(datetime.now().timestamp())}{file_extension}"
            file_path = f"uploads/{file_name}"
            
            with open(file_path, "wb") as f:
                f.write(profile_image.file.read())
            
            # Gera URL (Ajustada para funcionar localmente)
            user.profile_image = f"{BASE_URL}/{file_path}"
        except Exception as e:
            print(f"Erro ao salvar imagem: {e}")
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


# ============================
# 6. DELETAR CONTA
# ============================
@router.delete("/delete-account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta a conta do usuário logado"""
    user = db.merge(current_user)
    user_id = user.id
    
    # Deletar a foto de perfil se existir
    if user.profile_image:
        try:
            # Tenta extrair o caminho do arquivo da URL
            if "uploads/" in user.profile_image:
                file_part = user.profile_image.split("uploads/")[-1]
                file_path = f"uploads/{file_part}"
                if os.path.exists(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"Erro ao deletar imagem: {e}")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"Conta do usuário {user_id} deletada com sucesso"}