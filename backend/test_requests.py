#!/usr/bin/env python
"""
Test app with manual request simulation
"""
import sys
import json

try:
    print("Loading FastAPI test client...")
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    
    print("\n=== Testing GET / ===")
    response = client.get("/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    print("\n=== Testing GET /health ===")
    response = client.get("/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    print("\n=== Testing POST /register/ ===")
    payload = {
        "email": "teste@teste.com",
        "password": "senha123",
        "full_name": "Teste User",
        "account_type": "student"
    }
    response = client.post("/register/", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: email={data.get('email')}, id={data.get('id')}")
    else:
        print(f"Error: {response.text}")
    
    print("\n=== All tests passed! ===")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
