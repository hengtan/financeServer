"""
Database connection management

Shares the same PostgreSQL database with Node.js backend.
"""
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from functools import lru_cache
import os


@lru_cache()
def get_db_connection():
    """
    Get database connection engine (cached)

    Uses the same DATABASE_URL as Node.js/Prisma
    """
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    engine = create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using
        echo=os.getenv("NODE_ENV") == "development"
    )

    return engine


def test_connection():
    """Test database connection"""
    try:
        engine = get_db_connection()
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            return result.fetchone()[0] == 1
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
