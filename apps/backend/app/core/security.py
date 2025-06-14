# apps/backend/app/core/security.py
"""
Security utilities for password hashing, JWT tokens, and authentication.
"""
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.auth_access_token_expire_minutes
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.auth_secret_key, 
        algorithm=settings.auth_algorithm
    )
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT refresh token"""
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(days=settings.refresh_token_expire_days)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"  # Add token type to distinguish from access token
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.auth_secret_key,
        algorithm=settings.auth_algorithm
    )
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.auth_secret_key,
            algorithms=[settings.auth_algorithm]
        )
        return payload.get("sub")
    except JWTError:
        return None

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token"""
    delta = timedelta(hours=24)  # Token expires in 24 hours
    return create_access_token(subject=email, expires_delta=delta)

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify password reset token and return email"""
    return verify_token(token)