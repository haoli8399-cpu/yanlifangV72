from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "演立方 V7.2"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = "postgresql+asyncpg://admin:password@localhost:5433/yanlifang"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()