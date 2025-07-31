"""
Endpoints para gerenciamento de módulos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.permissions import require_admin, PermissionChecker
from ..schemas.modulo import ModuloCreate, ModuloUpdate, ModuloResponse, ModuloWithPermission
from ..services.modulo_service import ModuloService
from ..models.user import User

router = APIRouter(prefix="/modulos", tags=["módulos"])


@router.get("/", response_model=List[ModuloResponse])
def listar_modulos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    only_active: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar todos os módulos (apenas admins)
    """
    modulo_service = ModuloService(db)
    modulos = modulo_service.get_modulos(skip=skip, limit=limit, only_active=only_active)
    return modulos


@router.get("/me", response_model=List[ModuloWithPermission])
def listar_meus_modulos(
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Listar módulos do usuário atual
    """
    modulo_service = ModuloService(db)
    user = permission_checker.current_user
    
    # Obter módulos do usuário
    modulos_usuario = modulo_service.get_modulos_by_user(
        user.id, 
        include_admin_only=user.is_admin()
    )
    
    # Converter para ModuloWithPermission
    modulos_com_permissao = []
    for modulo in modulos_usuario:
        modulo_dict = modulo.__dict__.copy()
        modulo_dict['has_access'] = True
        modulos_com_permissao.append(ModuloWithPermission(**modulo_dict))
    
    return modulos_com_permissao


@router.get("/{modulo_id}", response_model=ModuloResponse)
def obter_modulo(
    modulo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obter dados de um módulo específico (apenas admins)
    """
    modulo_service = ModuloService(db)
    modulo = modulo_service.get_modulo_by_id(modulo_id)
    
    if not modulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    return modulo


@router.get("/slug/{slug}", response_model=ModuloResponse)
def obter_modulo_por_slug(
    slug: str,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Obter dados de um módulo pelo slug (com verificação de permissão)
    """
    # Verificar se usuário tem acesso ao módulo
    permission_checker.require_modulo_access(slug)
    
    modulo_service = ModuloService(db)
    modulo = modulo_service.get_modulo_by_slug(slug)
    
    if not modulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    return modulo


@router.post("/", response_model=ModuloResponse, status_code=status.HTTP_201_CREATED)
def criar_modulo(
    modulo_create: ModuloCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Criar novo módulo (apenas admins)
    """
    modulo_service = ModuloService(db)
    
    modulo = modulo_service.create_modulo(modulo_create)
    if not modulo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar módulo. Verifique se o slug não está em uso."
        )
    
    return modulo


@router.put("/{modulo_id}", response_model=ModuloResponse)
def atualizar_modulo(
    modulo_id: int,
    modulo_update: ModuloUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Atualizar dados de um módulo (apenas admins)
    """
    modulo_service = ModuloService(db)
    
    modulo = modulo_service.update_modulo(modulo_id, modulo_update)
    if not modulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado ou erro ao atualizar"
        )
    
    return modulo


@router.delete("/{modulo_id}")
def desativar_modulo(
    modulo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Desativar módulo (soft delete) - apenas admins
    """
    modulo_service = ModuloService(db)
    
    if not modulo_service.delete_modulo(modulo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    return {"message": "Módulo desativado com sucesso"}


@router.get("/available/for-role")
def listar_modulos_disponiveis(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar módulos disponíveis para cada role (apenas admins)
    """
    modulo_service = ModuloService(db)
    
    modulos_admin = modulo_service.get_available_modulos_for_user_role(is_admin=True)
    modulos_comum = modulo_service.get_available_modulos_for_user_role(is_admin=False)
    
    return {
        "admin": modulos_admin,
        "comum": modulos_comum
    }