from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from time import time

# Schemas e Models
from app.schemas.chat import MessageCreate
from app.services.ai_service import generate_ai_response
from app.core.config import MAX_INPUT_LENGTH
from app.database.database import get_db
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


# ===========================================================
# 🔒 RATE LIMIT PARA VISITANTES
# ===========================================================
guest_requests = {}  # IP -> [timestamps]

GUEST_LIMIT = 10       # máximo de mensagens
GUEST_WINDOW = 3600   # 1 hora (segundos)


@router.post("/")
async def chat(
    message: MessageCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # ===========================================================
    # 1. PEGA O CONTEÚDO
    # ===========================================================
    content = message.content or getattr(message, 'text', None)

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Mensagem vazia")

    if len(content) > MAX_INPUT_LENGTH:
        raise HTTPException(status_code=400, detail="Mensagem muito longa")

    # ===========================================================
    # 🔒 RATE LIMIT SE FOR VISITANTE
    # ===========================================================
    if not current_user:
        client_ip = request.client.host
        now = time()

        timestamps = guest_requests.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < GUEST_WINDOW]

        if len(timestamps) >= GUEST_LIMIT:
            # tempo restante até liberar
            oldest = min(timestamps)
            retry_after = int(GUEST_WINDOW - (now - oldest))

            raise HTTPException(
            status_code=429,
            detail={
                "message": "Limite de mensagens para visitantes atingido.",
                "retry_after": retry_after
            }
        )


        timestamps.append(now)
        guest_requests[client_ip] = timestamps

    # ===========================================================
    # 🔒 MODO CONVIDADO (SEM BANCO)
    # ===========================================================
    if not current_user:
        formatted_history = message.history or []
        formatted_history.append({"role": "user", "content": content})

        ai_response = generate_ai_response(
            formatted_history,
            user_id=None,
            user_name="Visitante",
            language=message.language
        )

        return {"reply": ai_response}

    # ===========================================================
    # 💾 MODO LOGADO (COM BANCO)
    # ===========================================================
    conv_id = message.conversation_id

    # Cria conversa se não existir
    if not conv_id:
        try:
            new_title = content[:30] + "..." if len(content) > 30 else content
            new_conv = Conversation(
                user_id=current_user.id,
                title=new_title,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(new_conv)
            db.commit()
            db.refresh(new_conv)
            conv_id = new_conv.id
        except Exception as e:
            db.rollback()
            print(f"❌ Erro ao criar conversa: {e}")
            raise HTTPException(status_code=500, detail="Erro ao criar conversa.")

    # Histórico da conversa
    db_history = db.query(Message)\
        .filter(Message.conversation_id == conv_id)\
        .order_by(Message.created_at.asc())\
        .all()

    formatted_history = [{"role": m.role, "content": m.content} for m in db_history]
    formatted_history.append({"role": "user", "content": content})

    # Resposta IA
    ai_response = generate_ai_response(
        formatted_history,
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_nickname=current_user.nickname,
        user_interests=current_user.interests,
        user_birth_date=current_user.birth_date,
        language=message.language
    )

    # Salva mensagens
    try:
        user_msg = Message(conversation_id=conv_id, role="user", content=content)
        ai_msg = Message(conversation_id=conv_id, role="assistant", content=ai_response)

        db.add(user_msg)
        db.add(ai_msg)

        db.query(Conversation).filter(Conversation.id == conv_id).update({
            "updated_at": datetime.utcnow()
        })

        db.commit()

        return {
            "reply": ai_response,
            "conversation_id": conv_id
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao salvar mensagens: {e}")
        return {"reply": ai_response, "conversation_id": conv_id}
