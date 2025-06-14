from fastapi import Request, HTTPException
from typing import List, Optional
from jose import jwt
from app.core.config import settings
from app.models.permission import Permission
from sqlalchemy.orm import Session
from app.db.session import get_db

async def check_permissions(
    request: Request,
    required_permissions: List[str],
    db: Session
) -> bool:
    """Check if the user has the required permissions"""
    try:
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        token = auth_header.split(" ")[1]
        
        # Decode JWT
        payload = jwt.decode(
            token,
            settings.auth_secret_key,
            algorithms=[settings.auth_algorithm]
        )
        
        # Get user permissions from JWT
        user_permissions = payload.get("permissions", [])
        
        # Check if user has all required permissions
        return all(perm in user_permissions for perm in required_permissions)
        
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def require_permissions(permissions: List[str]):
    """Decorator to require specific permissions for an endpoint"""
    async def decorator(request: Request):
        db = next(get_db())
        if not await check_permissions(request, permissions, db):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )
    return decorator

def get_user_permissions(user_id: int, db: Session) -> List[str]:
    """Get all permissions for a user, including inherited permissions"""
    # Get user's roles
    user_roles = db.query(Role).join(
        user_roles
    ).filter(
        user_roles.c.user_id == user_id
    ).all()
    
    # Get all permissions from roles and their parent roles
    permissions = set()
    for role in user_roles:
        # Get direct permissions
        role_perms = db.query(Permission).join(
            role_permissions
        ).filter(
            role_permissions.c.role_id == role.id
        ).all()
        permissions.update(perm.name for perm in role_perms)
        
        # Get permissions from parent roles
        parent_role = role.parent_role
        while parent_role:
            parent_perms = db.query(Permission).join(
                role_permissions
            ).filter(
                role_permissions.c.role_id == parent_role.id
            ).all()
            permissions.update(perm.name for perm in parent_perms)
            parent_role = parent_role.parent_role
    
    return list(permissions) 