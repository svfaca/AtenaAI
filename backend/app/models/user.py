from sqlalchemy import Column, Integer, String, Text, Date
from sqlalchemy.orm import relationship

from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Autenticação
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Dados básicos
    full_name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)  # student | teacher | livre

    # Perfil
    nickname = Column(String, nullable=True)  # Apelido opcional
    interests = Column(Text, nullable=True)
    profile_image = Column(String, nullable=True)  # URL ou path
    gender = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)

    # 🔥 RELACIONAMENTO COM CHAT
    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )
