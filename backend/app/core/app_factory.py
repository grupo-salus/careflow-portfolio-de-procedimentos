"""Factory para criação da aplicação FastAPI"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .config import settings
from .middlewares import setup_middlewares
from ..routers import auth, admin, empresa, modulo, procedimento, insumo, admin_modules


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle da aplicação"""
    # Startup
    print(f"Iniciando {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Ambiente: {settings.ENVIRONMENT}")
    print(f"Debug: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    print("Encerrando aplicação...")


def create_app() -> FastAPI:
    """Criar e configurar a aplicação FastAPI"""
    
    # Criar aplicação FastAPI
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="API de autenticação e gerenciamento para o sistema CareFlow",
        lifespan=lifespan
    )
    
    # Configurar middlewares
    setup_middlewares(app)
    
    # Incluir routers
    _include_routers(app)
    
    # Incluir endpoints básicos
    _include_basic_endpoints(app)
    
    return app


def _include_routers(app: FastAPI) -> None:
    """Incluir todos os routers da aplicação com prefixo v1"""
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticação"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administração"])
    app.include_router(empresa.router, prefix="/api/v1/empresas", tags=["Empresas"])
    app.include_router(modulo.router, prefix="/api/v1/modulos", tags=["Módulos"])
    app.include_router(procedimento.router, prefix="/api/v1/procedimentos", tags=["Procedimentos"])
    app.include_router(insumo.router, prefix="/api/v1/insumos", tags=["Insumos"])
    app.include_router(admin_modules.router, prefix="/api/v1/admin/modulos", tags=["Admin - Módulos"])


def _include_basic_endpoints(app: FastAPI) -> None:
    """Incluir endpoints básicos da aplicação"""
    
    @app.get("/")
    async def root():
        """Endpoint raiz"""
        return {
            "message": f"Bem-vindo à {settings.APP_NAME}",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "environment": settings.ENVIRONMENT}