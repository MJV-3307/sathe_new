"""
One-time script to create the FIRST admin account, bypassing the API.

Why this exists: /auth/register now requires an admin to be logged in
(see main.py), which means there's no way to create the very first
admin through the API — you'd need an admin to already exist to create
an admin. This script breaks that chicken-and-egg problem by talking
to the database directly.

Run this once, from the backend/ folder, with your virtual environment
active:

    python -m app.scripts.create_admin

After the first admin exists, use that admin's login + the (now
admin-only) POST /auth/register endpoint to create every other account
— including any additional admins — instead of running this again.
"""

import asyncio
import os
from getpass import getpass

from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

from fastapi_users_db_beanie import BeanieUserDatabase
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.user import User
from app.schemas import UserCreate
from app.users import UserManager
from pymongo import AsyncMongoClient


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "faculty_scheduler")
client = AsyncMongoClient(MONGO_URI)

async def create_admin() -> None:
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=client[MONGO_DB_NAME], document_models=[User])

    print("--- Create the first admin account ---")
    email = input("Admin email: ").strip()
    password = getpass("Admin password: ")
    password_confirm = getpass("Confirm password: ")
    if password != password_confirm:
        print("Passwords don't match. Aborting.")
        return
    department = input("Department (optional, press Enter to skip): ").strip() or None

    user_db = BeanieUserDatabase(User)
    user_manager = UserManager(user_db)

    user_create = UserCreate(
        email=email,
        password=password,
        role="admin",
        department=department,
        is_committee_member=False,
    )

    try:
        user = await user_manager.create(user_create)
    except Exception as e:  # e.g. fastapi_users.exceptions.UserAlreadyExists
        print(f"Failed to create admin: {e}")
        return

    print(f"\nAdmin account created: {user.email} (role={user.role})")
    print("You can now log in via /auth/jwt/login and use /auth/register to add everyone else.")


if __name__ == "__main__":
    asyncio.run(create_admin())
