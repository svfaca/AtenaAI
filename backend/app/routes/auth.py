from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.user import UserResponse
from pydantic import BaseModel
from fastapi import File, UploadFile
from typing import Optional, List
from datetime import date, datetime
import json
import os

router = APIRouter(prefix="/auth", tags=["Auth"])


class EmailCheckRequest(BaseModel):
    email: str


class EmailCheckResponse(BaseModel):
    available: bool
    message: str


@router.post("/check-email", response_model=EmailCheckResponse)
def check_email(data: EmailCheckRequest, db: Session = Depends(get_db)):
    """Verifica se um email já está registrado"""
    existing_user = db.query(User).filter(User.email == data.email).first()
    
    if existing_user:
        return {
            "available": False,
            "message": "Este email já está registrado."
        }
    
    return {
        "available": True,
        "message": "Email disponível!"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário logado"""
    return current_user


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
    
    # Atualizar campos básicos (ignorar strings vazias)
    if full_name and full_name.strip():
        user.full_name = full_name.strip()
    if nickname and nickname.strip():
        user.nickname = nickname.strip()
    if email and email.strip():
        user.email = email.strip()
    if birth_date and birth_date.strip():
        try:
            # Converter string de data para objeto date
            user.birth_date = datetime.strptime(birth_date.strip(), '%Y-%m-%d').date()
        except ValueError:
            print(f"Erro ao parsear data: {birth_date}")
    if gender and gender.strip():
        user.gender = gender.strip()
    if account_type and account_type.strip():
        user.account_type = account_type.strip()
    
    # Atualizar interesses (JSON string)
    if interests:
        try:
            # Tentar parsear como JSON
            interests_list = json.loads(interests)
            user.interests = interests
        except json.JSONDecodeError:
            # Se não conseguir parsear, guardar como está
            user.interests = interests
    
    # Salvar imagem de perfil
    if profile_image and profile_image.filename:
        try:
            # Criar diretório se não existir
            os.makedirs("uploads", exist_ok=True)
            
            # Salvar arquivo com nome único
            file_extension = os.path.splitext(profile_image.filename)[1]
            file_path = f"uploads/{user.id}_{int(__import__('time').time())}{file_extension}"
            
            with open(file_path, "wb") as f:
                f.write(profile_image.file.read())
            
            user.profile_image = f"http://127.0.0.1:8000/{file_path}"
        except Exception as e:
            print(f"Erro ao salvar imagem: {e}")
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/delete-account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta a conta do usuário logado"""
    
    # Merge do usuário para a nova sessão
    user = db.merge(current_user)
    user_id = user.id
    
    # Deletar a foto de perfil se existir
    if user.profile_image:
        try:
            # Extrair caminho local se for URL
            if user.profile_image.startswith("http"):
                file_path = user.profile_image.split("http://127.0.0.1:8000/", 1)[-1]
            else:
                file_path = user.profile_image
            
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Erro ao deletar imagem: {e}")
    
    # Deletar o usuário (as conversas serão deletadas automaticamente pelo cascade)
    db.delete(user)
    db.commit()
    
    return {"message": f"Conta do usuário {user_id} deletada com sucesso"}
