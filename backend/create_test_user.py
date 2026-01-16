#!/usr/bin/env python
"""Script para criar usuário de teste no banco de dados"""

from app.database.database import SessionLocal, engine
from app.models.user import Base, User
from app.core.security import hash_password

# Cria tabelas
Base.metadata.create_all(bind=engine)

# Cria sessão
db = SessionLocal()

# Verifica se usuário já existe
existing = db.query(User).filter(User.email == 'teste@teste.com').first()
if existing:
    print(f'✅ Usuário teste@teste.com já existe')
else:
    # Cria novo usuário
    user = User(
        email='teste@teste.com',
        full_name='Usuário Teste',
        hashed_password=hash_password('senha123'),
        account_type='student'
    )
    db.add(user)
    db.commit()
    print(f'✅ Usuário criado: teste@teste.com / senha123')

db.close()
