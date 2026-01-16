from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date
import json


# =========================
# INPUTS
# =========================

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    account_type: str

    nickname: Optional[str] = None
    interests: Optional[str] = None
    profile_image: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None


class UserLogin(BaseModel):
    email: str
    password: str


# =========================
# OUTPUTS
# =========================

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    account_type: str
    nickname: Optional[str] = None
    interests: Optional[List[str]] = None
    profile_image: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None

    @field_validator('interests', mode='before')
    @classmethod
    def parse_interests(cls, v):
        """Converte string JSON para lista"""
        if isinstance(v, str) and v:
            try:
                parsed = json.loads(v)
                # Se for uma lista vazia, retorna None ou lista vazia
                if isinstance(parsed, list) and len(parsed) == 0:
                    return []
                return parsed
            except json.JSONDecodeError:
                return []
        return v or []

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
