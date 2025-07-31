"""
Endpoints para módulos administrativos - com proteção dupla
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.permissions import require_admin_or_modulo_access
from ..models.user import User

router = APIRouter(tags=["módulos administrativos"])


@router.get("/admin_usuarios")
def gerenciar_usuarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_modulo_access("admin_usuarios"))
):
    """
    Endpoint para gerenciar usuários - apenas admins podem acessar
    """
    return {
        "message": "Gerenciamento de Usuários",
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role
        }
    }


@router.get("/admin_empresas")
def gerenciar_empresas(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_modulo_access("admin_empresas"))
):
    """
    Endpoint para gerenciar empresas - apenas admins podem acessar
    """
    return {
        "message": "Gerenciamento de Empresas",
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role
        }
    }


@router.get("/configuracoes")
def configuracoes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_modulo_access("configuracoes"))
):
    """
    Endpoint para configurações - apenas admins podem acessar
    """
    return {
        "message": "Configurações do Sistema",
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role
        }
    } 