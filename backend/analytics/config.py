"""
Analytics Service Configuration
"""
import os
from functools import lru_cache


class Settings:
    """Application settings"""

    def __init__(self):
        # Environment
        self.environment = os.getenv("NODE_ENV", "development")
        self.debug = self.environment == "development"

        # Server
        self.host = "0.0.0.0"
        self.port = 8000

        # Database (shared with Node.js backend)
        self.database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/financedb")

        # Redis (optional - for caching)
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

        # OpenAI (for AI agents)
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")

        # CORS
        self.cors_origins = ["http://localhost:5173", "http://localhost:5174", "https://mocktstudio.com.br"]

        # JWT (shared with Node.js)
        self.jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
