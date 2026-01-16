#!/usr/bin/env python
"""
Test app with manual request simulation - including login
"""
import sys
import json

try:
    print("Loading FastAPI test client...")
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    
    print("\n=== Testing POST /login/ ===")
    login_payload = {
        "email": "teste@teste.com",
        "password": "senha123"
    }
    response = client.post("/login/", json=login_payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ LOGIN SUCCESS!")
        print(f"   Token: {data.get('access_token')[:20]}...")
        print(f"   Token Type: {data.get('token_type')}")
    else:
        print(f"❌ Error: {response.text}")
    
    print("\n=== All tests passed! ===")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
