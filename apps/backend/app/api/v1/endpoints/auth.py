from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas import Token, UserCreate, UserResponse, UserUpdate
from typing import Any

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        employment_status=user_in.employment_status,
        current_role=user_in.current_role,
        experience_level=user_in.experience_level,
        primary_interests=user_in.primary_interests,
        how_did_you_hear=user_in.how_did_you_hear,
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = security.create_access_token(subject=user.email)
    refresh_token = security.create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user.
    """
    try:
        # Get the user from the database
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )
        
        # Check if email is being updated and if it's already taken
        if user_in.email and user_in.email != user.email:
            existing_user = db.query(User).filter(User.email == user_in.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Email already registered",
                )
        
        # Update user fields
        update_data = user_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.patch("/me/password", response_model=UserResponse)
async def update_password_me(
    *,
    db: Session = Depends(deps.get_db),
    current_password: str = Body(...),
    new_password: str = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user's password.
    """
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )
        
        if not security.verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Incorrect password",
            )
        
        user.hashed_password = security.get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 