import os

class Settings:
    PROJECT_NAME: str = "Darukaa.Earth Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "darukaa_earth_super_secret_jwt_key_2026_hackathon_secure!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Dual database support:
    # Use PostgreSQL + PostGIS if DATABASE_URL is set; otherwise SQLite fallback for instant zero-dependency local run
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./darukaa_earth.db"
    )

settings = Settings()
