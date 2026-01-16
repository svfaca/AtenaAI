# AtenaAI 🎓

AtenaAI é uma plataforma de assistente educacional inteligente, projetada para auxiliar estudantes em seus estudos através de inteligência artificial. O projeto oferece uma interface moderna e intuitiva com suporte a temas claro/escuro, chat em tempo real e gerenciamento de conversas.

## ✨ Features

- 🤖 **Chat Inteligente**: Assistente de IA especializado em educação
- 🌓 **Tema Claro/Escuro**: Interface adaptável para diferentes preferências
- 💬 **Gestão de Conversas**: Crie, renomeie, copie e delete conversas
- 👤 **Autenticação Completa**: Sistema de registro e login seguro
- 📚 **Áreas de Interesse**: Personalize de acordo com suas matérias
- 🎨 **UI Moderna**: Design minimalista e responsivo
- 🔒 **Segurança**: JWT tokens e hash de senhas com bcrypt

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para gerenciamento de banco de dados
- **OpenAI API** - Integração com GPT para respostas inteligentes
- **Python-Jose** - JWT para autenticação
- **Passlib** - Hashing seguro de senhas

### Frontend
- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS utilitário
- **Vanilla JavaScript** - Lógico sem dependências pesadas
- **Fetch API** - Comunicação com backend

## 📁 Estrutura do Projeto

```
AtenaAI/
├── backend/
│   ├── app/
│   │   ├── ai/              # Integração com LLM
│   │   ├── auth/            # Sistema de autenticação
│   │   ├── core/            # Configurações e segurança
│   │   ├── database/        # Conexão com banco de dados
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── routes/          # Rotas da API
│   │   ├── schemas/         # Schemas Pydantic
│   │   └── services/        # Lógica de negócio
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── assets/
│   │   └── logo/           # Logos e favicons
│   ├── js/                 # Scripts JavaScript
│   ├── index.html          # Página principal (chat)
│   ├── login.html
│   ├── cadastro.html
│   └── quem-somos.html
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- Conta OpenAI com API Key

### Backend

1. Clone o repositório:
```bash
git clone https://github.com/svfaca/AtenaAI.git
cd AtenaAI
```

2. Crie e ative o ambiente virtual:
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

3. Instale as dependências:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
Crie um arquivo `.env` na pasta `backend/` com:
```env
OPENAI_API_KEY=sua_chave_api_aqui
SECRET_KEY=sua_chave_secreta_jwt
```

5. Inicie o servidor:
```bash
uvicorn app.main:app --reload
```

O backend estará rodando em `http://127.0.0.1:8000`

### Frontend

1. Abra o arquivo `frontend/index.html` em um navegador ou use um servidor local:
```bash
# Com Python
cd frontend
python -m http.server 8080

# Com Node.js (npx)
npx serve frontend
```

2. Acesse no navegador:
- Frontend: `http://localhost:8080`
- API Docs: `http://127.0.0.1:8000/docs`

## 📖 Como Usar

1. **Cadastro**: Crie uma conta como estudante ou professor
2. **Login**: Acesse com suas credenciais
3. **Chat**: Comece a conversar com a AtenaAI
4. **Conversas**: Gerencie suas conversas no painel lateral
5. **Configurações**: Personalize suas áreas de interesse

## 🎨 Temas

A AtenaAI oferece suporte completo a tema claro e escuro:
- Alternância automática baseada na preferência do sistema
- Toggle manual disponível em todas as páginas
- Logos adaptativas para cada tema
- Persistência da preferência no localStorage

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT tokens
- Validação de dados com Pydantic
- CORS configurado adequadamente
- Proteção contra SQL injection via ORM

## 📝 API Endpoints

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login

### Conversas
- `GET /conversations/` - Listar conversas
- `POST /conversations/` - Criar conversa
- `GET /conversations/{id}` - Obter conversa
- `PUT /conversations/{id}` - Atualizar conversa
- `DELETE /conversations/{id}` - Deletar conversa

### Chat
- `POST /chat/send` - Enviar mensagem

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Nosta** - [GitHub](https://github.com/svfaca)

## 🙏 Agradecimentos

- OpenAI pela API GPT
- Comunidade FastAPI
- Tailwind CSS
- Todos os contribuidores

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
