from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import Conversation, Message
from app.schemas.message import ChatMessage
from app.schemas.chat import ConversationResponse, MessageResponse
from app.core.dependencies import get_current_user, get_db
from app.core.prompts import get_system_prompt
from app.ai.llm import get_client

router = APIRouter(prefix="/conversations", tags=["Conversations"])


# ============================
# LISTAR CONVERSAS (SIDEBAR)
# ============================
@router.get("/", response_model=list[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


# ============================
# PEGAR CONVERSA + MENSAGENS
# ============================
@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    return conv


# ============================
# CRIAR NOVA CONVERSA
# ============================
@router.post("/", response_model=ConversationResponse)
def create_conversation(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = Conversation(
        user_id=user.id,
        title="Nova conversa"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return conv


# ============================
# ENVIAR MENSAGEM + IA
# ============================
@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: ChatMessage,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    # 1️⃣ salva mensagem do usuário
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=payload.text
    )
    db.add(user_msg)
    db.commit()

    # 2️⃣ monta contexto da IA
    history = [
        {"role": "system", "content": get_system_prompt(payload.language)}
    ]

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
        .all()
    )

    for msg in messages:
        history.append({
            "role": msg.role,
            "content": msg.content
        })

    # 3️⃣ chama IA
    client = get_client()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history
    )

    reply = response.choices[0].message.content

    # 4️⃣ salva resposta da IA
    ai_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=reply
    )
    db.add(ai_msg)
    db.commit()

    return {
        "conversation_id": conv.id,
        "reply": reply
    }


# ============================
# ATUALIZAR TÍTULO
# ============================
from pydantic import BaseModel

class UpdateConversationRequest(BaseModel):
    title: str

@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int,
    request: UpdateConversationRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    conv.title = request.title
    db.commit()
    db.refresh(conv)

    return conv


# ============================
# DELETAR CONVERSA
# ============================
@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    db.delete(conv)
    db.commit()

    return {"message": "Conversa deletada com sucesso"}
