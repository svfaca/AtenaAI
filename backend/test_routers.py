#!/usr/bin/env python
import sys
import traceback

try:
    print("Testing router imports...")
    
    print("1. Importing chat router...")
    from app.routes.chat import router as chat_router
    print("   ✓ Chat router OK")
    
    print("2. Importing conversations router...")
    from app.routes.conversations import router as conversations_router
    print("   ✓ Conversations router OK")
    
    print("3. Importing auth router...")
    from app.routes.auth import router as auth_router
    print("   ✓ Auth router OK")
    
    print("4. Importing register router...")
    from app.auth.register import router as register_router
    print("   ✓ Register router OK")
    
    print("5. Importing login router...")
    from app.auth.login import router as login_router
    print("   ✓ Login router OK")
    
    print("\nAll routers imported successfully!")
    
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
