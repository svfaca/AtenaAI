from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, default="Nova conversa")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔗 relação com User (ESTAVA FALTANDO)
    user = relationship("User", back_populates="conversations")

    # 🔗 relação com Message
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )
