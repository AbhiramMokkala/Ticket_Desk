import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        ENVIRONMENT: str = "development"
        LOG_LEVEL: str = "INFO"

        # Database
        DATABASE_URL: str = "postgresql://ticketdesk_user:ticketdesk_secure_password_2026@postgres:5432/ticketdesk_db"

        # Security & Auth
        JWT_SECRET: str = "TicketDeskJwtSecretKeyForEnterprisePOC2026SecureStringMustBe256BitsLong!"
        JWT_ALGORITHM: str = "HS512"
        JWT_ISSUER: str = "ticketdesk-auth-service"
        JWT_AUDIENCE: str = "ticketdesk-platform"
        INTERNAL_SERVICE_KEY: str = "TicketDeskInternalServiceAuthSecret2026!"

        # Internal Microservice Links
        JAVA_SERVICE_URL: str = "http://java-ticket-service:8080"

        # Storage Settings
        STORAGE_PROVIDER: str = "local"
        LOCAL_STORAGE_DIR: str = "/data/attachments"
        AWS_REGION: str = "us-east-1"
        S3_BUCKET_NAME: str = "ticketdesk-poc-attachments"

        # Validation Limits
        MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB
        ALLOWED_EXTENSIONS: list[str] = [".png", ".jpg", ".jpeg", ".pdf", ".txt", ".docx"]
        ALLOWED_CONTENT_TYPES: list[str] = [
            "image/png",
            "image/jpeg",
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]

        class Config:
            env_file = ".env"
            extra = "ignore"

    settings = Settings()

except ImportError:
    class FallbackSettings:
        ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
        LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
        DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://ticketdesk_user:ticketdesk_secure_password_2026@postgres:5432/ticketdesk_db")
        JWT_SECRET = os.environ.get("JWT_SECRET", "TicketDeskJwtSecretKeyForEnterprisePOC2026SecureStringMustBe256BitsLong!")
        JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
        JWT_ISSUER = os.environ.get("JWT_ISSUER", "ticketdesk-auth-service")
        JWT_AUDIENCE = os.environ.get("JWT_AUDIENCE", "ticketdesk-platform")
        INTERNAL_SERVICE_KEY = os.environ.get("INTERNAL_SERVICE_KEY", "TicketDeskInternalServiceAuthSecret2026!")
        JAVA_SERVICE_URL = os.environ.get("JAVA_SERVICE_URL", "http://java-ticket-service:8080")
        STORAGE_PROVIDER = os.environ.get("STORAGE_PROVIDER", "local")
        LOCAL_STORAGE_DIR = os.environ.get("LOCAL_STORAGE_DIR", "/data/attachments")
        AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
        S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "ticketdesk-poc-attachments")
        MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
        ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".txt", ".docx"]
        ALLOWED_CONTENT_TYPES = [
            "image/png", "image/jpeg", "application/pdf", "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]

    settings = FallbackSettings()

