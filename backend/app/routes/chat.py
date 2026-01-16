from fastapi import APIRouter, HTTPException
from app.schemas.chat import MessageCreate
from app.services.ai_service import generate_ai_response
from app.core.config import MAX_INPUT_LENGTH


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/")
async def chat(message: MessageCreate):
    """
    Endpoint de chat - sem autenticação necessária
    
    Args:
        message: Mensagem do usuário com todos os dados opcionais
        
    Returns:
        Resposta da IA personalizada com base nos dados do usuário
    """
    # Validar comprimento
    if len(message.content) > MAX_INPUT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Mensagem excede o limite de {MAX_INPUT_LENGTH} caracteres"
        )
    
    if not message.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Mensagem não pode estar vazia"
        )
    
    ai_response = generate_ai_response(
        [{"role": "user", "content": message.content}],
        user_id=message.user_id,
        user_email=message.user_email,
        user_name=message.user_name,
        user_nickname=message.user_nickname,
        user_account_type=message.user_account_type,
        user_interests=message.user_interests,
        user_gender=message.user_gender,
        user_birth_date=message.user_birth_date
    )
    
    return {"reply": ai_response}

