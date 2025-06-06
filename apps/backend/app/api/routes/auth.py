from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserResponse, Token, PasswordReset, PasswordResetConfirm
from app.services.auth import AuthService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> User:
    """
    Register a new user.
    """
    return AuthService.create_user(db=db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user, access_token, refresh_token = AuthService.authenticate_user(
        db=db,
        user_in=UserLogin(email=form_data.username, password=form_data.password)
    )
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
) -> Token:
    """
    Refresh access token.
    """
    access_token, new_refresh_token = AuthService.refresh_tokens(
        db=db,
        refresh_token=refresh_token
    )
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current user.
    """
    return current_user

@router.post("/password-reset", status_code=status.HTTP_200_OK)
def request_password_reset(
    email: PasswordReset,
    db: Session = Depends(get_db)
) -> dict:
    """
    Request password reset.
    """
    token = AuthService.create_password_reset_token(db=db, email=email.email)
    # TODO: Send email with reset link
    return {"message": "Password reset email sent"}

@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
) -> dict:
    """
    Reset password.
    """
    AuthService.reset_password(
        db=db,
        token=reset_data.token,
        new_password=reset_data.new_password
    )
    return {"message": "Password updated successfully"} 