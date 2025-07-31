from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
from .timezone_utils import get_timezone

# Criar engine do SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log das queries SQL quando em modo debug
    pool_pre_ping=True,   # Verificar conexão antes de usar
    pool_recycle=300,     # Reciclar conexões a cada 5 minutos
)

# Configurar timezone para MySQL/PostgreSQL
@event.listens_for(engine, "connect")
def set_timezone(dbapi_connection, connection_record):
    """Configura o timezone da conexão do banco de dados"""
    try:
        # Para MySQL
        if 'mysql' in settings.DATABASE_URL:
            with dbapi_connection.cursor() as cursor:
                cursor.execute(f"SET time_zone = '{settings.TIMEZONE}'")
        # Para PostgreSQL
        elif 'postgresql' in settings.DATABASE_URL:
            with dbapi_connection.cursor() as cursor:
                cursor.execute(f"SET timezone = '{settings.TIMEZONE}'")
    except Exception:
        # Se falhar, continua sem configurar timezone
        pass

# Criar sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()


# Dependency para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()