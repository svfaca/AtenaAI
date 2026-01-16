from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date


class MessageCreate(BaseModel):
    content: str = Field(..., alias="text")
    # Dados do usuário (todos exceto senha)
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_nickname: Optional[str] = None
    user_account_type: Optional[str] = None
    user_interests: Optional[str] = None
    user_gender: Optional[str] = None
    user_birth_date: Optional[date] = None

    class Config:
        populate_by_name = True


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[MessageResponse]

    class Config:
        from_attributes = True

