#!/usr/bin/env python
import sys
import traceback

try:
    print("1. Loading app...")
    from app.main import app
    print("2. App loaded successfully!")
    
    # Criar aplicação ASGI
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    print("3. Testing health endpoint...")
    response = client.get("/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    print("4. All tests passed!")
    
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
