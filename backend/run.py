"""
Script para executar o servidor FastAPI
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Recarregar automaticamente em mudanças (apenas para desenvolvimento)
        log_level="info"
    )