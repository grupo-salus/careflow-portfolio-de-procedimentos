"""
Endpoints administrativos - apenas para usuários admin
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.permissions import require_admin, PermissionChecker
from ..schemas.user import (
    UserResponse, UserCompleto, UserUpdate, UserCreate,
    UserEmpresaAssociation, UserModuloAssociation, UserPermissions
)
from ..schemas.empresa import EmpresaResponse
from ..schemas.modulo import ModuloResponse
from ..services.user_service import UserService
from ..services.empresa_service import EmpresaService
from ..services.modulo_service import ModuloService
from ..services.permission_service import PermissionService
from ..models.user import User

router = APIRouter(prefix="/admin", tags=["administração"])


@router.get("/users", response_model=List[UserResponse])
def listar_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    only_active: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar todos os usuários (apenas admins)
    """
    user_service = UserService(db)
    users = user_service.get_users(skip=skip, limit=limit, only_active=only_active)
    return users


@router.get("/users/{user_id}", response_model=UserCompleto)
def obter_usuario_completo(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obter dados completos de um usuário (com empresas e módulos)
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return user


@router.post("/users", response_model=UserResponse)
def criar_usuario_admin(
    user_create: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Criar novo usuário (apenas admins)
    """
    user_service = UserService(db)
    
    # Criar usuário
    created_user = user_service.create_user(user_create, setup_default_permissions=False)
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar usuário"
        )
    
    return created_user


@router.put("/users/{user_id}", response_model=UserResponse)
def atualizar_usuario_admin(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Atualizar qualquer usuário (apenas admins)
    """
    user_service = UserService(db)
    
    # Verificar se usuário existe
    if not user_service.get_user_by_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar usuário
    updated_user = user_service.update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar usuário"
        )
    
    return updated_user


@router.post("/users/{user_id}/promote")
def promover_usuario_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Promover usuário comum a administrador
    """
    user_service = UserService(db)
    
    if not user_service.promote_to_admin(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {"message": "Usuário promovido a administrador com sucesso"}


@router.post("/users/{user_id}/demote")
def rebaixar_usuario_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Rebaixar administrador a usuário comum
    """
    # Impedir que o admin se rebaixe
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode rebaixar a si mesmo"
        )
    
    user_service = UserService(db)
    
    if not user_service.demote_from_admin(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {"message": "Usuário rebaixado a comum com sucesso"}


@router.post("/users/{user_id}/activate")
def ativar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Ativar usuário desativado
    """
    user_service = UserService(db)
    
    if not user_service.activate_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {"message": "Usuário ativado com sucesso"}


@router.post("/users/{user_id}/deactivate")
def desativar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Desativar usuário
    """
    # Impedir que o admin se desative
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode desativar a si mesmo"
        )
    
    user_service = UserService(db)
    
    if not user_service.deactivate_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {"message": "Usuário desativado com sucesso"}


@router.delete("/users/{user_id}")
def deletar_usuario_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Deletar um usuário (apenas admins)
    """
    # Verificar se não está tentando deletar a si mesmo
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode deletar a si mesmo"
        )
    
    user_service = UserService(db)
    
    # Verificar se usuário existe
    user_to_delete = user_service.get_user_by_id(user_id)
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Deletar usuário
    if not user_service.delete_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao deletar usuário"
        )
    
    return {"message": "Usuário deletado com sucesso"}


@router.post("/users/{user_id}/reset-password")
def resetar_senha_usuario_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Resetar senha de um usuário (apenas admins)
    """
    user_service = UserService(db)
    
    # Verificar se usuário existe
    user_to_reset = user_service.get_user_by_id(user_id)
    if not user_to_reset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Gerar nova senha aleatória
    import secrets
    import string
    new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    # Atualizar senha do usuário
    from ..schemas.user import UserUpdate
    user_update = UserUpdate(password=new_password)
    
    updated_user = user_service.update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao resetar senha"
        )
    
    return {
        "message": "Senha resetada com sucesso",
        "new_password": new_password
    }


@router.get("/users/{user_id}/permissions", response_model=UserPermissions)
def obter_permissoes_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obter todas as permissões de um usuário
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    permission_service = PermissionService(db)
    permissions = permission_service.get_user_permissions(user)
    
    return permissions


@router.post("/users/{user_id}/empresas")
def adicionar_usuario_empresa(
    user_id: int,
    association: UserEmpresaAssociation,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Adicionar usuário a uma empresa
    """
    # Validar se user_id bate com o da associação
    if user_id != association.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID do usuário na URL não corresponde ao corpo da requisição"
        )
    
    empresa_service = EmpresaService(db)
    
    # Verificar se empresa existe
    if not empresa_service.get_empresa_by_id(association.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Adicionar associação
    if not empresa_service.add_user_to_empresa(
        user_id, association.empresa_id, association.is_admin_empresa
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já está associado a esta empresa ou erro ao criar associação"
        )
    
    return {"message": "Usuário adicionado à empresa com sucesso"}


@router.delete("/users/{user_id}/empresas/{empresa_id}")
def remover_usuario_empresa(
    user_id: int,
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Remover usuário de uma empresa
    """
    empresa_service = EmpresaService(db)
    
    if not empresa_service.remove_user_from_empresa(user_id, empresa_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associação não encontrada"
        )
    
    return {"message": "Usuário removido da empresa com sucesso"}


@router.post("/users/{user_id}/modulos")
def adicionar_usuario_modulo(
    user_id: int,
    association: UserModuloAssociation,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Adicionar usuário a um módulo
    """
    # Validar se user_id bate com o da associação
    if user_id != association.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID do usuário na URL não corresponde ao corpo da requisição"
        )
    
    modulo_service = ModuloService(db)
    
    # Verificar se módulo existe
    if not modulo_service.get_modulo_by_id(association.modulo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    # Adicionar associação
    if not modulo_service.add_user_to_modulo(user_id, association.modulo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já tem acesso a este módulo ou erro ao criar associação"
        )
    
    return {"message": "Usuário adicionado ao módulo com sucesso"}


@router.delete("/users/{user_id}/modulos/{modulo_id}")
def remover_usuario_modulo(
    user_id: int,
    modulo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Remover usuário de um módulo
    """
    modulo_service = ModuloService(db)
    
    if not modulo_service.remove_user_from_modulo(user_id, modulo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associação não encontrada"
        )
    
    return {"message": "Usuário removido do módulo com sucesso"}


@router.get("/stats")
def obter_estatisticas_sistema(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obter estatísticas gerais do sistema
    """
    user_service = UserService(db)
    empresa_service = EmpresaService(db)
    modulo_service = ModuloService(db)
    
    user_stats = user_service.count_users_by_role()
    
    empresas = empresa_service.get_empresas()
    modulos = modulo_service.get_modulos()
    
    return {
        "usuarios": user_stats,
        "empresas": {
            "total": len(empresas),
            "ativas": len([e for e in empresas if e.is_active])
        },
        "modulos": {
            "total": len(modulos),
            "ativos": len([m for m in modulos if m.is_active]),
            "admin_only": len([m for m in modulos if m.is_admin_only])
        }
    }