"""
Endpoints para gerenciamento de empresas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.permissions import require_admin, PermissionChecker, get_accessible_empresas_ids
from ..schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse, EmpresaWithStats
from ..services.empresa_service import EmpresaService
from ..models.user import User

router = APIRouter(tags=["empresas"])


@router.get("/", response_model=List[EmpresaResponse])
def listar_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    only_active: bool = Query(True),
    accessible_empresas_ids: List[int] = Depends(get_accessible_empresas_ids),
    db: Session = Depends(get_db)
):
    """
    Listar empresas (filtradas pelas permissões do usuário)
    """
    empresa_service = EmpresaService(db)
    
    # Obter todas as empresas
    empresas = empresa_service.get_empresas(skip=skip, limit=limit, only_active=only_active)
    
    # Filtrar apenas empresas que o usuário pode acessar
    empresas_filtradas = [
        empresa for empresa in empresas 
        if empresa.id in accessible_empresas_ids
    ]
    
    return empresas_filtradas


@router.get("/{empresa_id}", response_model=EmpresaResponse)
def obter_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Obter dados de uma empresa específica
    """
    # Verificar permissão de acesso
    permission_checker.require_empresa_access(empresa_id)
    
    empresa_service = EmpresaService(db)
    empresa = empresa_service.get_empresa_by_id(empresa_id)
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return empresa


@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
def criar_empresa(
    empresa_create: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Criar nova empresa (apenas admins)
    """
    empresa_service = EmpresaService(db)
    
    empresa = empresa_service.create_empresa(empresa_create)
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar empresa. Verifique se o nome não está em uso."
        )
    
    return empresa


@router.put("/{empresa_id}", response_model=EmpresaResponse)
def atualizar_empresa(
    empresa_id: int,
    empresa_update: EmpresaUpdate,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Atualizar dados de uma empresa
    """
    # Verificar permissão de gerenciamento
    permission_checker.require_empresa_management(empresa_id)
    
    empresa_service = EmpresaService(db)
    
    empresa = empresa_service.update_empresa(empresa_id, empresa_update)
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada ou erro ao atualizar"
        )
    
    return empresa


@router.delete("/{empresa_id}")
def desativar_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Desativar empresa (soft delete) - apenas admins
    """
    empresa_service = EmpresaService(db)
    
    if not empresa_service.delete_empresa(empresa_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return {"message": "Empresa desativada com sucesso"}


@router.get("/me/list", response_model=List[EmpresaResponse])
def listar_minhas_empresas(
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Listar empresas do usuário atual
    """
    empresas_ids = permission_checker.get_accessible_empresas_ids()
    
    empresa_service = EmpresaService(db)
    empresas = []
    
    for empresa_id in empresas_ids:
        empresa = empresa_service.get_empresa_by_id(empresa_id)
        if empresa and empresa.is_active:
            empresas.append(empresa)
    
    return empresas