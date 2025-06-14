from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employment_status: Optional[str] = None
    current_role: Optional[str] = None
    experience_level: Optional[str] = None
    primary_interests: Optional[List[str]] = None
    how_did_you_hear: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str
    full_name: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employment_status: Optional[str] = None
    current_role: Optional[str] = None
    experience_level: Optional[str] = None
    primary_interests: Optional[List[str]] = Field(default_factory=list)
    how_did_you_hear: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    is_superuser: bool
    is_email_verified: bool

    class Config:
        from_attributes = True 