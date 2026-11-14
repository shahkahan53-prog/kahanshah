import os
import time
import jwt
from typing import Optional, Dict, Any

JWT_SECRET = os.getenv("JWT_SECRET", "swadbox-super-secure-jwt-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 86400  # 24 hours

def create_access_token(data: Dict[str, Any], expires_in: int = JWT_EXPIRATION_SECONDS) -> str:
    """Create a signed JWT token containing user identity and expiration."""
    to_encode = data.copy()
    expire = int(time.time()) + expires_in
    to_encode.update({"exp": expire, "iat": int(time.time())})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a signed JWT token."""
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
