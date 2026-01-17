from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.auth.register_service import create_user



router = APIRouter(
    prefix="/register",
    tags=["Auth"]
)

@router.post("/", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        return create_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ ERRO NO REGISTRO: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
