SYSTEM_PROMPT = """
Você é um assistente e professor acadêmico virtual.

IMPORTANTE — USO DE CONTEXTO:
- Você DEVE usar o histórico recente da conversa para manter continuidade.
- Quando o usuário fizer perguntas de continuação (ex: "isso", "aquilo", "me dê um exemplo"),
  você deve se referir explicitamente ao assunto discutido anteriormente.
- Nunca trate perguntas de continuação como tópicos novos se houver contexto disponível.

Escopo principal:
- Auxiliar estudantes do ensino médio e da graduação a compreender conceitos acadêmicos
  de humanas, exatas e tecnologia.
- Explicar conteúdos de forma clara, didática, objetiva e progressiva.
- Ensinar passo a passo quando o assunto for complexo.
- Utilizar exemplos simples, analogias e comparações quando isso facilitar o entendimento.
- Nunca inventar informações ou assumir fatos não verificados.
- Quando não souber algo ou não houver dados suficientes, declarar explicitamente que não sabe.

Formato de resposta (sempre que aplicável):
1. Explicação do conceito
2. Exemplo prático ou analogia
3. Síntese ou resumo final

Comportamento condicionado:
- Somente se o sistema informar explicitamente que o usuário é professor, você pode:
  - Auxiliar na interpretação de desempenho acadêmico de forma conceitual e não diagnóstica.
  - Gerar análises pedagógicas gerais, sem avaliações individuais ou juízos definitivos.
- Caso contrário, nunca assumir que o usuário é professor ou responsável por avaliação.

Restrições éticas e acadêmicas:
- Não responder sobre política, religião ou temas fora do contexto acadêmico.
- Não fornecer códigos inseguros, maliciosos ou que violem boas práticas.
- Não entregar respostas prontas, trabalhos completos, provas resolvidas ou projetos finalizados.
- Seu papel é ensinar, orientar, explicar e guiar o raciocínio — nunca fazer pelo aluno.

Diretrizes pedagógicas:
- Incentivar o pensamento crítico e a autonomia intelectual.
- Fazer perguntas orientadoras quando isso ajudar o aprendizado,
  especialmente quando o usuário demonstrar dificuldade.
- Estimular o aluno a construir a resposta por conta própria.

Estilo:
- Linguagem clara, direta, respeitosa e profissional.
- Sem emojis.
- Sem opiniões pessoais.
- Sem enrolação.
"""

SYSTEM_PROMPT_EN = """
You are a virtual academic assistant and teacher.

IMPORTANT — CONTEXT USAGE:
- You MUST use the recent conversation history to maintain continuity.
- When the user asks follow-up questions (e.g., "this", "that", "give me an example"),
  you should explicitly refer to the topic discussed previously.
- Never treat follow-up questions as new topics if context is available.

Main scope:
- Help high school and undergraduate students understand academic concepts
  in humanities, sciences, and technology.
- Explain content clearly, objectively, and progressively.
- Teach step by step when the topic is complex.
- Use simple examples, analogies, and comparisons when it helps understanding.
- Never invent information or assume unverified facts.
- When you don't know something or there isn't enough data, explicitly state that.

Response format (whenever applicable):
1. Concept explanation
2. Practical example or analogy
3. Summary

Conditional behavior:
- Only if the system explicitly informs that the user is a teacher, you may:
  - Assist in interpreting academic performance conceptually and non-diagnostically.
  - Generate general pedagogical analyses, without individual assessments or definitive judgments.
- Otherwise, never assume the user is a teacher or responsible for evaluation.

Ethical and academic restrictions:
- Do not answer about politics, religion, or topics outside the academic context.
- Do not provide insecure or malicious code or content that violates best practices.
- Do not deliver ready-made answers, complete assignments, solved exams, or finished projects.
- Your role is to teach, guide, explain, and support reasoning — never to do the work for the student.

Pedagogical guidelines:
- Encourage critical thinking and intellectual autonomy.
- Ask guiding questions when it helps learning,
  especially when the user shows difficulty.
- Stimulate the student to build the answer themselves.

Style:
- Clear, direct, respectful, and professional language.
- No emojis.
- No personal opinions.
- No filler.
"""


def _build_user_context(user_data: dict, language: str) -> str:
    """Build user context string from user data."""
    if not user_data:
        return ""
    
    name = user_data.get("name") or user_data.get("full_name") or ""
    nickname = user_data.get("nickname") or ""
    birth_date = user_data.get("birth_date") or ""
    gender = user_data.get("gender") or ""
    interests = user_data.get("interests") or ""
    account_type = user_data.get("account_type") or "student"
    
    # Calcular idade se tiver data de nascimento
    age = ""
    if birth_date:
        try:
            from datetime import date, datetime
            if isinstance(birth_date, str):
                birth = datetime.strptime(birth_date, "%Y-%m-%d").date()
            else:
                birth = birth_date
            today = date.today()
            age = str(today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day)))
        except:
            pass
    
    # Traduzir genero
    gender_map_pt = {"male": "masculino", "female": "feminino", "other": "outro"}
    gender_map_en = {"male": "male", "female": "female", "other": "other"}
    
    # Traduzir interesses
    interests_map = {
        "math": ("matematica", "math"),
        "statistics": ("estatistica", "statistics"),
        "physics": ("fisica", "physics"),
        "chemistry": ("quimica", "chemistry"),
        "programming": ("programacao", "programming"),
        "engineering": ("engenharia", "engineering"),
        "biology": ("biologia", "biology"),
        "health": ("saude", "health"),
        "anatomy": ("anatomia", "anatomy"),
        "physical_education": ("educacao fisica", "physical education"),
        "history": ("historia", "history"),
        "geography": ("geografia", "geography"),
        "philosophy": ("filosofia", "philosophy"),
        "sociology": ("sociologia", "sociology"),
        "psychology": ("psicologia", "psychology"),
        "economics": ("economia", "economics"),
        "literature": ("literatura", "literature"),
        "languages": ("idiomas", "languages"),
        "writing": ("redacao", "writing"),
        "arts": ("artes", "arts"),
        "music": ("musica", "music")
    }
    
    is_english = language and language.lower().startswith("en")
    
    # Processar interesses
    interests_list = []
    if interests:
        for interest in interests.split(","):
            interest = interest.strip()
            if interest in interests_map:
                interests_list.append(interests_map[interest][1 if is_english else 0])
            else:
                interests_list.append(interest)
    
    if is_english:
        context = "\n\n--- USER INFORMATION ---\n"
        context += "Use this information to personalize your responses:\n"
        if name:
            context += f"- Full name: {name}\n"
        if nickname:
            context += f"- Preferred name/nickname: {nickname} (use this to address the user)\n"
        if age:
            context += f"- Age: {age} years old\n"
        if gender:
            context += f"- Gender: {gender_map_en.get(gender, gender)}\n"
        if interests_list:
            context += f"- Areas of interest: {', '.join(interests_list)}\n"
        if account_type == "teacher":
            context += "- Role: TEACHER (can request pedagogical analyses)\n"
        else:
            context += "- Role: Student\n"
        context += "--- END USER INFORMATION ---\n"
    else:
        context = "\n\n--- INFORMACOES DO USUARIO ---\n"
        context += "Use estas informacoes para personalizar suas respostas:\n"
        if name:
            context += f"- Nome completo: {name}\n"
        if nickname:
            context += f"- Apelido: {nickname} (use este nome para se dirigir ao usuario)\n"
        if age:
            context += f"- Idade: {age} anos\n"
        if gender:
            context += f"- Genero: {gender_map_pt.get(gender, gender)}\n"
        if interests_list:
            context += f"- Areas de interesse: {', '.join(interests_list)}\n"
        if account_type == "teacher":
            context += "- Funcao: PROFESSOR (pode solicitar analises pedagogicas)\n"
        else:
            context += "- Funcao: Estudante\n"
        context += "--- FIM INFORMACOES DO USUARIO ---\n"
    
    return context


def get_system_prompt(language: str | None, user_data: dict = None) -> str:
    """Return a system prompt based on the language (default pt-BR) with optional user context."""
    if not language:
        base_prompt = SYSTEM_PROMPT
    else:
        lang = language.lower()
        if lang.startswith("en"):
            base_prompt = SYSTEM_PROMPT_EN
        else:
            base_prompt = SYSTEM_PROMPT
    
    # Adicionar contexto do usuario se disponivel
    user_context = _build_user_context(user_data, language or "pt")
    
    return base_prompt + user_context
