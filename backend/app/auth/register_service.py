from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
import json


def create_user(db: Session, user: UserCreate):
    # Normaliza o tipo de conta para aceitar tanto "student" quanto "estudante"
    normalized_account_type = (user.account_type or "").strip().lower()
    if normalized_account_type in ("student", "estudante"):
        account_type = "student"
    else:
        raise ValueError("Tipo de conta ainda não disponível.")
    
    # Verificar se email já existe
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise ValueError("Este email já está registrado. Tente fazer login ou use outro email.")

    # Converter interesses para JSON se for uma string
    interests_json = None
    if user.interests:
        if isinstance(user.interests, str):
            # Se é uma string "Matemática, Física", converter para lista JSON
            interests_list = [i.strip() for i in user.interests.split(",")]
            interests_json = json.dumps(interests_list)
        else:
            # Se é uma lista, converter para JSON
            interests_json = json.dumps(user.interests)

    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
        account_type=account_type,
        nickname=user.nickname,
        interests=interests_json,
        profile_image=user.profile_image,
        gender=user.gender,
        birth_date=user.birth_date
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
