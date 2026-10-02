import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "apsrtc-smart-platform-dev-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "apsrtc-jwt-token-dev-secret-key-2026")
    JWT_EXPIRATION_DELTA = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440")))

    # Database configuration
    # Default to sqlite for local zero-dependency execution; PostgreSQL/Supabase via DATABASE_URL
    is_vercel = bool(os.getenv("VERCEL"))
    default_db = "sqlite:////tmp/apsrtc.db" if is_vercel else f"sqlite:///{os.path.join(BASE_DIR, 'apsrtc.db')}"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", default_db)
    # Fix for SQLAlchemy postgres:// vs postgresql://
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads (/tmp when deployed serverless on Vercel)
    default_upload_dir = "/tmp/uploads" if is_vercel else os.path.join(BASE_DIR, "uploads")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", default_upload_dir)
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH_MB", "5")) * 1024 * 1024
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

    # SMS Gateway Configuration
    SMS_PROVIDER = os.getenv("SMS_PROVIDER", "mock")
    SMS_API_KEY = os.getenv("SMS_API_KEY", "")
    SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "APSRTC")
    SMS_WEBHOOK_SECRET = os.getenv("SMS_WEBHOOK_SECRET", "test_webhook_secret_key")

    # Initial Admin Seed
    INITIAL_ADMIN_EMAIL = os.getenv("INITIAL_ADMIN_EMAIL", "admin@apsrtc.ap.gov.in")
    INITIAL_ADMIN_NAME = os.getenv("INITIAL_ADMIN_NAME", "APSRTC System Administrator")
    INITIAL_ADMIN_PASSWORD = os.getenv("INITIAL_ADMIN_PASSWORD", "ApsrtcAdmin@2026#Secure")

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SMS_PROVIDER = "mock"
