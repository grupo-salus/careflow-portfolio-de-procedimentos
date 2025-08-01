"""Ponto de entrada principal da aplicação FastAPI"""
import uvicorn
from .core.app_factory import create_app
from .core.config import settings

# Criar aplicação FastAPI usando o factory
app = create_app()


def run_server():
    """Executar o servidor uvicorn com as configurações apropriadas"""
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
        workers=settings.WORKERS if not settings.DEBUG else 1
    )


if __name__ == "__main__":
    run_server()


    