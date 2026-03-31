from datetime import datetime, timedelta

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserMeResponse(BaseModel):
    user_id: str
    email: str
    role: str
    fpo_id: str | None
    language_preference: str
    last_login: datetime | None

