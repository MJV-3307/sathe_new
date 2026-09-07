import os
from typing import Optional

from beanie import PydanticObjectId
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users_db_beanie import BeanieUserDatabase, ObjectIDIDMixin

from app.models.user import User

# Load from .env — never hardcode this in real deployment.
SECRET = os.getenv("JWT_SECRET")
if not SECRET:
    raise RuntimeError(
        "JWT_SECRET is not set. Add it to your .env file "
        "(see .env.example) before starting the app."
    )

# --- Session length ---
# Access token lifetime: how long a login stays valid before the user
# must log in again. 8 hours is a reasonable default for a workday.
JWT_LIFETIME_SECONDS = 60 * 60 * 8


async def get_user_db():
    yield BeanieUserDatabase(User)


class UserManager(ObjectIDIDMixin, BaseUserManager[User, PydanticObjectId]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        # Hook for later: e.g. send a welcome email, or auto-flag
        # certain college email domains as faculty, etc.
        print(f"User registered: {user.email} (role={user.role})")


async def get_user_manager(user_db: BeanieUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


# --- Transport + strategy: how the token travels, and what kind it is ---
# BearerTransport: client sends "Authorization: Bearer <token>" on each request.
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=JWT_LIFETIME_SECONDS)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, PydanticObjectId](get_user_manager, [auth_backend])

# --- Reusable dependencies for route protection ---
current_active_user = fastapi_users.current_user(active=True)
current_verified_user = fastapi_users.current_user(active=True, verified=True)
