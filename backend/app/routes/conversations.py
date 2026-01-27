from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# ✅ Importação dos modelos e esquemas
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.message import ChatMessage
from app.schemas.chat import ConversationResponse, MessageResponse
from app.core.dependencies import get_current_user, get_db
from app.core.prompts import get_system_prompt
from app.services.ai_service import get_client

router = APIRouter(prefix="/conversations", tags=["Conversations"])

# ============================
# SCHEMAS LOCAIS
# ============================
class CreateConversationRequest(BaseModel):
    title: Optional[str] = "Nova conversa"

class UpdateConversationRequest(BaseModel):
    title: str

# ============================
# 1. LISTAR CONVERSAS
# ============================
@router.get("/", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Retorna todas as conversas do usuário logado
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc()) # Ordena pelas mais recentes
        .all()
    )

# ============================
# 2. PEGAR CONVERSA ÚNICA (HISTÓRICO)
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

    # ✅ O segredo do histórico: O objeto 'conv' já deve carregar 
    # a lista 'messages' se o relacionamento no Model estiver correto.
    return conv

# ============================
# 3. CRIAR CONVERSA
# ============================
@router.post("/", response_model=ConversationResponse)
def create_conversation(
    request: CreateConversationRequest = CreateConversationRequest(),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    title = request.title if request.title else "Nova conversa"
    conv = Conversation(
        user_id=user.id,
        title=title
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return conv

# ============================
# 4. ENVIAR MENSAGEM (CHAT)
# ============================
@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: ChatMessage,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    # 1. Salva mensagem do usuário (Usando 'content' ou 'text')
    content = payload.text if hasattr(payload, 'text') else payload.content
    
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=content
    )
    db.add(user_msg)
    
    # 2. Prepara dados para a IA (Prompt Personalizado)
    user_data = {
        "name": user.full_name,
        "nickname": user.nickname,
        "birth_date": user.birth_date,
        "gender": user.gender,
        "interests": user.interests,
        "account_type": user.account_type
    }
    
    system_instruction = get_system_prompt(payload.language or "pt-BR", user_data)
    
    # Monta histórico para a API da OpenAI
    messages_query = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    history = [{"role": "system", "content": system_instruction}]
    for msg in messages_query:
        history.append({"role": msg.role, "content": msg.content})

    # 3. Chama IA
    try:
        client = get_client()
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=history
        )
        reply = response.choices[0].message.content

        # 4. Salva resposta da IA
        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=reply
        )
        db.add(ai_msg)
        
        # Atualiza o timestamp da conversa
        conv.updated_at = datetime.utcnow()
        
        db.commit()
        return {"conversation_id": conv.id, "reply": reply}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")

# ============================
# 5. DUPLICAR CONVERSA
# ============================
@router.post("/{conversation_id}/duplicate", response_model=ConversationResponse)
def duplicate_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    original_conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()

    if not original_conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    new_conv = Conversation(user_id=user.id, title=f"Cópia - {original_conv.title}")
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)

    original_messages = db.query(Message).filter(Message.conversation_id == original_conv.id).all()
    for msg in original_messages:
        db.add(Message(conversation_id=new_conv.id, role=msg.role, content=msg.content))
    
    db.commit()
    db.refresh(new_conv)
    return new_conv

# ============================
# 6. RENOMEAR E DELETAR (IGUAIS AO ORIGINAL)
# ============================
@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: int, request: UpdateConversationRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user.id).first()
    if not conv: raise HTTPException(status_code=404, detail="Não encontrada")
    conv.title = request.title
    db.commit()
    return conv

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user.id).first()
    if not conv: raise HTTPException(status_code=404, detail="Não encontrada")
    db.query(Message).filter(Message.conversation_id == conv.id).delete()
    db.delete(conv)
    db.commit()
    return {"message": "Deletado"}