from pydantic_settings import BaseSettings
from typing import Optional
import os
import secrets


class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = ""
    
    # Configurações JWT
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações da Aplicação
    APP_NAME: str = "CareFlow Auth API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Configurações de CORS
    ALLOWED_ORIGINS: str = ""
    
    # Configurações de Timezone
    TIMEZONE: str = "America/Sao_Paulo"
    
    # Configurações de Segurança
    ENVIRONMENT: str = "production"
    
    # Configurações de Banco de Dados
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "careflow_procedimentos"
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    
    # Configurações do Servidor
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    WORKERS: int = 4
    TIMEOUT: int = 30
    MAX_UPLOAD_SIZE: int = 10
    
    # Configurações de Pool do Banco de Dados
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    def validate_config(self):
        """Validar configurações críticas"""
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY deve ser configurada")
        
        if not self.DATABASE_URL and not all([self.DB_HOST, self.DB_NAME, self.DB_USER, self.DB_PASSWORD]):
            raise ValueError("DATABASE_URL ou configurações individuais do banco devem ser fornecidas")
        
        # Validações específicas para produção
        if self.is_production:
            if self.DEBUG:
                raise ValueError("DEBUG deve ser False em produção")
            
            if not self.ALLOWED_ORIGINS:
                raise ValueError("ALLOWED_ORIGINS deve ser configurada em produção")
            
            if "localhost" in self.ALLOWED_ORIGINS or "127.0.0.1" in self.ALLOWED_ORIGINS:
                raise ValueError("ALLOWED_ORIGINS não deve conter localhost/127.0.0.1 em produção")
            
            if len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY deve ter pelo menos 32 caracteres em produção")
        
        # Validações para desenvolvimento
        elif self.is_development:
            if not self.ALLOWED_ORIGINS:
                # Em desenvolvimento, permitir localhost por padrão
                self.ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
    
    def get_database_url(self) -> str:
        """Construir DATABASE_URL se não fornecida"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Instanciar configurações
settings = Settings()

# Validar configurações críticas
try:
    settings.validate_config()
except ValueError as e:
    if settings.is_development:
        print(f"⚠️  Aviso de configuração: {e}")
        print("   Configure as variáveis de ambiente ou crie um arquivo .env")
    else:
        raise e