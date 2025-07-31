from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine
from .models import *  # Importar todos os modelos para criar as tabelas
from .models.user import Base
from .routers import auth, admin, empresa, modulo

# Criar as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="API de autenticação para CareFlow - Portfolio de Procedimentos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(empresa.router, prefix="/api/v1")
app.include_router(modulo.router, prefix="/api/v1")

# Importar e incluir novos routers
from .routers import procedimento, insumo
app.include_router(procedimento.router, prefix="/api/v1")
app.include_router(insumo.router, prefix="/api/v1")

# Endpoint de saúde
@app.get("/")
def root():
    return {
        "message": "CareFlow Authentication API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)