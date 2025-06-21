from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
import httpx
import json
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from app.core.config import settings

security = HTTPBearer(auto_error=False)

class ClerkAuth:
    def __init__(self):
        self.clerk_secret_key = settings.CLERK_SECRET_KEY
        self._jwks_cache = None
        
    async def get_clerk_jwks(self):
        """Fetch Clerk's JWKS (JSON Web Key Set) for token verification"""
        if self._jwks_cache:
            return self._jwks_cache
            
        try:
            # Get the issuer from environment or use default
            issuer = f"https://clerk.{settings.CLERK_SECRET_KEY.split('_')[1]}.lcl.dev"
            jwks_url = f"{issuer}/.well-known/jwks.json"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(jwks_url)
                if response.status_code == 200:
                    self._jwks_cache = response.json()
                    return self._jwks_cache
        except Exception as e:
            print(f"Error fetching JWKS: {e}")
            
        return None
        
    async def verify_token(self, credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> dict:
        if not credentials:
            print("No credentials provided in request")
            raise HTTPException(status_code=403, detail="No authentication credentials provided")
            
        token = credentials.credentials
        print(f"Token length: {len(token) if token else 0}")
        print(f"Token first 100 chars: {token[:100]}..." if token and len(token) > 100 else token)
        
        try:
            # For development, decode without full verification but validate structure
            # First, decode header to get algorithm
            header = jwt.get_unverified_header(token)
            print(f"Token header: {header}")
            
            # Decode the token without verification (for development)
            payload = jwt.get_unverified_claims(token)
            print(f"Token payload keys: {list(payload.keys())}")
            
            # Extract user_id from Clerk token
            # Clerk tokens typically have the user ID in the 'sub' field
            user_id = payload.get("sub")
            print(f"User ID from token: {user_id}")
            
            if not user_id:
                raise HTTPException(status_code=403, detail="Invalid token: no user ID")
                
            return {"user_id": user_id, "payload": payload}
            
        except JWTError as e:
            print(f"JWT Error: {e}")
            raise HTTPException(status_code=403, detail="Invalid authentication token")
        except Exception as e:
            print(f"Auth Error: {e}")
            raise HTTPException(status_code=403, detail="Authentication failed")

clerk_auth = ClerkAuth()

async def get_current_user(auth_data: dict = Security(clerk_auth.verify_token)) -> str:
    return auth_data["user_id"]