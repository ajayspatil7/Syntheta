# apps/backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import List, Optional

from app.db.session import Base
from app.core.security import verify_password as verify_pwd

class User(Base):
    __tablename__ = "users"

    # Core user fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    
    # Status fields
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_email_verified = Column(Boolean, default=False)
    
    # Timestamp fields
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Profile fields from signup form
    employment_status = Column(String, nullable=True)  # 'Employed', 'Unemployed', 'Student', 'Freelancer'
    current_role = Column(String, nullable=True)  # 'Data Scientist', 'ML Engineer', etc.
    experience_level = Column(String, nullable=True)  # '0–1 years', '2–4 years', '5+ years'
    primary_interests = Column(JSON, nullable=True)  # Array of interests as JSON
    how_did_you_hear = Column(String, nullable=True)  # Marketing attribution

    # Relationships - using string references to avoid circular imports
    workspaces = relationship("Workspace", back_populates="owner")
    
    # Authentication relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"

    def to_dict(self) -> dict:
        """Convert user to dictionary (useful for API responses)"""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "is_email_verified": self.is_email_verified,
            "employment_status": self.employment_status,
            "current_role": self.current_role,
            "experience_level": self.experience_level,
            "primary_interests": self.primary_interests,
            "how_did_you_hear": self.how_did_you_hear,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @property
    def is_authenticated(self) -> bool:
        """Check if user is authenticated (active and email verified)"""
        return self.is_active and self.is_email_verified

    def verify_password(self, password: str) -> bool:
        """Verify a password against the user's hashed password"""
        return verify_pwd(password, self.hashed_password)

    def set_password(self, password: str) -> None:
        """Set a new password for the user"""
        from app.core.security import get_password_hash
        self.hashed_password = get_password_hash(password)