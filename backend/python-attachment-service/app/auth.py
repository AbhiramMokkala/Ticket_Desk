import uuid
import requests
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

security = HTTPBearer()

class AuthenticatedUser:
    def __init__(self, user_id: uuid.UUID, email: str, role: str, full_name: str):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.full_name = full_name

    @property
    def is_privileged(self) -> bool:
        return self.role in ["ADMINISTRATOR", "SUPPORT_AGENT"]

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> AuthenticatedUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256", "HS512"],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER
        )
        user_id_str: str = payload.get("userId") or payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role", "EMPLOYEE")
        full_name: str = payload.get("fullName", "User")

        if role.startswith("ROLE_"):
            role = role[5:]

        if not user_id_str or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is missing required user identity claims"
            )

        return AuthenticatedUser(
            user_id=uuid.UUID(user_id_str),
            email=email,
            role=role,
            full_name=full_name
        )
    except (JWTError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}"
        )

def verify_ticket_access(ticket_id: uuid.UUID, user: AuthenticatedUser) -> bool:
    """Verifies that the user has authorization to access the specified ticket via Java internal service."""
    if user.is_privileged:
        return True

    try:
        url = f"{settings.JAVA_SERVICE_URL}/api/internal/tickets/{ticket_id}/verify-access"
        headers = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_KEY}
        params = {"userId": str(user.user_id)}
        response = requests.get(url, headers=headers, params=params, timeout=5)

        if response.status_code == 200:
            data = response.json()
            return data.get("canAccess", False)
        return False
    except Exception as e:
        # In testing or standalone mode, fail secure
        print(f"Warning: Failed to reach Java internal service for ticket auth: {e}")
        return False
