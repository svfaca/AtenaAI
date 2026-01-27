from openai import OpenAI
from app.core.prompts import get_system_prompt
from app.core.config import AI_MODEL
from datetime import date
import logging
import os

logger = logging.getLogger(__name__)

# Cliente global
client = None


def get_client():
    """Obtém ou cria cliente OpenAI com validação de chave"""
    global client
    
    if client is not None:
        return client

    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("OPENAI_API_KEY não configurada")
        raise ValueError("OPENAI_API_KEY não configurada")

    client = OpenAI(api_key=api_key)
    logger.info("Cliente OpenAI inicializado com sucesso")
    return client


def generate_ai_response(
    messages: list,
    user_id: int = None,
    user_email: str = None,
    user_name: str = None,
    user_nickname: str = None,
    user_account_type: str = None,
    user_interests: str = None,
    user_gender: str = None,
    user_birth_date: date = None,
    language: str | None = None
):
    """Gera resposta da IA usando OpenAI e contexto do usuário"""

    try:
        system_prompt = get_system_prompt(language)

        # Adiciona contexto do usuário
        if any([user_name, user_email, user_interests, user_gender,
                user_birth_date, user_account_type, user_nickname]):

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

            system_prompt += "\nUse essas informações para personalizar as respostas."

        client = get_client()

        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Erro ao chamar IA: {str(e)}", exc_info=True)
        return "Desculpe, ocorreu um erro ao processar sua mensagem."
