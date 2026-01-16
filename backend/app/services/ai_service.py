from app.ai.llm import get_client
from app.core.prompts import SYSTEM_PROMPT
from app.core.config import AI_MODEL, OPENAI_API_KEY
from datetime import date
import logging

logger = logging.getLogger(__name__)


def generate_ai_response(
    messages: list,
    user_id: int = None,
    user_email: str = None,
    user_name: str = None,
    user_nickname: str = None,
    user_account_type: str = None,
    user_interests: str = None,
    user_gender: str = None,
    user_birth_date: date = None
):
    """
    Gera resposta da IA usando OpenAI com informações completas do usuário.
    
    Args:
        messages: Lista de mensagens no formato [{"role": "user", "content": "..."}]
        user_id: ID do usuário
        user_email: Email do usuário
        user_name: Nome completo do usuário
        user_nickname: Apelido do usuário
        user_account_type: Tipo de conta (student, teacher, livre)
        user_interests: Interesses/áreas de estudo
        user_gender: Gênero do usuário
        user_birth_date: Data de nascimento
    
    Returns:
        Resposta gerada pela IA ou mensagem de erro
    """
    try:
        # Verificar se a chave API está disponível
        if not OPENAI_API_KEY:
            logger.error("OPENAI_API_KEY não configurada")
            return "Erro: Serviço de IA não configurado corretamente. Chave API ausente."
        
        # Construir prompt do sistema com informações do usuário se disponível
        system_prompt = SYSTEM_PROMPT
        
        # Adicionar contexto do usuário ao prompt se houver dados
        if any([user_name, user_email, user_interests, user_gender, user_birth_date, user_account_type, user_nickname]):
            system_prompt += "\n\n=== INFORMAÇÕES DO USUÁRIO ===\n"
            
            if user_name:
                system_prompt += f"Nome: {user_name}\n"
            if user_nickname:
                system_prompt += f"Apelido: {user_nickname}\n"
            if user_email:
                system_prompt += f"Email: {user_email}\n"
            if user_gender:
                system_prompt += f"Gênero: {user_gender}\n"
            if user_birth_date:
                system_prompt += f"Data de Nascimento: {user_birth_date}\n"
            if user_account_type:
                system_prompt += f"Tipo de Conta: {user_account_type}\n"
            if user_interests:
                system_prompt += f"Áreas de Interesse: {user_interests}\n"
            
            system_prompt += "\nUse essas informações para personalizar suas respostas de forma relevante, contextualizada e amigável ao usuário."
        
        logger.info(f"Enviando mensagem para IA: {messages[0]['content'][:50]}...")
        
        client = get_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ]
        )
        
        logger.info("Resposta recebida da IA com sucesso")
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Erro ao chamar IA: {str(e)}", exc_info=True)
        return f"Desculpe, ocorreu um erro ao processar sua mensagem: {str(e)}"
