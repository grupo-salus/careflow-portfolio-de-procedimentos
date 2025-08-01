"""Configuração de middlewares da aplicação"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings


def setup_middlewares(app: FastAPI) -> None:
    """Configurar todos os middlewares da aplicação"""
    _setup_cors_middleware(app)
    _setup_exception_handlers(app)


def _setup_cors_middleware(app: FastAPI) -> None:
    """Configurar CORS de forma segura"""
    origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )


def _setup_exception_handlers(app: FastAPI) -> None:
    """Configurar handlers de exceção"""
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """Handler global para exceções não tratadas"""
        if settings.DEBUG:
            # Em desenvolvimento, mostrar erro completo
            return JSONResponse(
                status_code=500,
                content={"detail": str(exc), "type": type(exc).__name__}
            )
        else:
            # Em produção, erro genérico
            return JSONResponse(
                status_code=500,
                content={"detail": "Erro interno do servidor"}
            )