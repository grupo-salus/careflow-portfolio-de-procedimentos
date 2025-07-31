from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/careflow_procedimentos"
    
    # Configurações JWT
    SECRET_KEY: str = "careflow-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações da Aplicação
    APP_NAME: str = "CareFlow Auth API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Configurações de CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Configurações de Timezone
    TIMEZONE: str = "America/Sao_Paulo"
    
    class Config:
        env_file = ".env"


settings = Settings()