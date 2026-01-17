from openai import OpenAI
import os
import logging

logger = logging.getLogger(__name__)

# Cliente global - será inicializado quando necessário
client = None

def get_client():
    """Obter ou criar cliente OpenAI com validação de chave"""
    global client
    
    if client is not None:
        return client
    
    # Buscar chave dinamicamente do ambiente
    import os
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("⚠️  OPENAI_API_KEY não está configurada!")
        raise ValueError("OPENAI_API_KEY não está configurada")
    
    client = OpenAI(api_key=api_key)
    logger.info("✅ Cliente OpenAI inicializado com sucesso")
    return client

def generate_response(user_text: str) -> str:
    from app.core.prompts import SYSTEM_PROMPT
    client = get_client()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ]
    )

    return response.choices[0].message.content
