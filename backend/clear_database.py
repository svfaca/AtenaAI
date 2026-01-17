#!/usr/bin/env python3
"""Script para limpar o banco de dados"""

import os
from sqlalchemy import inspect, MetaData, Table, delete
from app.database.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message

def clear_database():
    """Limpa todas as tabelas do banco de dados"""
    
    print("🗑️  Limpando banco de dados...")
    
    db = SessionLocal()
    
    try:
        # Opção 1: Delete all records from each table
        print("  - Deletando usuários...")
        db.query(Message).delete()
        
        print("  - Deletando conversas...")
        db.query(Conversation).delete()
        
        print("  - Deletando mensagens...")
        db.query(Message).delete()
        
        db.commit()
        print("✅ Banco de dados limpo com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao limpar banco de dados: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_database()
