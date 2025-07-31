"""
Sistema de permissões e dependências para controle de acesso
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .dependencies import get_current_user
from .database import get_db
from ..models.user import User
from ..services.permission_service import PermissionService


def get_permission_service(db: Session = Depends(get_db)) -> PermissionService:
    """Obter instância do serviço de permissões"""
    return PermissionService(db)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency que requer usuário admin"""
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este recurso."
        )
    return current_user


def require_empresa_access(empresa_id: int):
    """Factory para criar dependency que verifica acesso à empresa"""
    def _check_empresa_access(
        current_user: User = Depends(get_current_user),
        permission_service: PermissionService = Depends(get_permission_service)
    ) -> User:
        if not permission_service.user_can_access_empresa(current_user, empresa_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Você não tem permissão para acessar dados desta empresa."
            )
        return current_user
    
    return _check_empresa_access


def require_empresa_management(empresa_id: int):
    """Factory para criar dependency que verifica permissão de gerenciar empresa"""
    def _check_empresa_management(
        current_user: User = Depends(get_current_user),
        permission_service: PermissionService = Depends(get_permission_service)
    ) -> User:
        if not permission_service.user_can_manage_empresa(current_user, empresa_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Você não tem permissão para gerenciar esta empresa."
            )
        return current_user
    
    return _check_empresa_management


def require_modulo_access(modulo_slug: str):
    """Factory para criar dependency que verifica acesso ao módulo"""
    def _check_modulo_access(
        current_user: User = Depends(get_current_user),
        permission_service: PermissionService = Depends(get_permission_service)
    ) -> User:
        if not permission_service.user_can_access_modulo(current_user, modulo_slug):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Você não tem permissão para acessar o módulo '{modulo_slug}'."
            )
        return current_user
    
    return _check_modulo_access


def require_admin_or_modulo_access(modulo_slug: str):
    """Factory para criar dependency que verifica se é admin OU tem acesso ao módulo"""
    def _check_admin_or_modulo_access(
        current_user: User = Depends(get_current_user),
        permission_service: PermissionService = Depends(get_permission_service)
    ) -> User:
        # Se é admin, permite acesso
        if current_user.is_admin():
            return current_user
        
        # Se não é admin, verifica se o módulo é administrativo
        if modulo_slug.startswith('admin_') or modulo_slug == 'configuracoes':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas administradores podem acessar módulos administrativos."
            )
        
        # Se não é módulo administrativo, verifica se tem acesso
        if not permission_service.user_can_access_modulo(current_user, modulo_slug):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Você não tem permissão para acessar o módulo '{modulo_slug}'."
            )
        
        return current_user
    
    return _check_admin_or_modulo_access


def filter_empresas_by_permission(
    empresas_ids: List[int],
    current_user: User = Depends(get_current_user),
    permission_service: PermissionService = Depends(get_permission_service)
) -> List[int]:
    """Filtrar lista de empresas baseado nas permissões do usuário"""
    return permission_service.filter_empresas_by_permission(current_user, empresas_ids)


def get_accessible_empresas_ids(
    current_user: User = Depends(get_current_user),
    permission_service: PermissionService = Depends(get_permission_service)
) -> List[int]:
    """Obter IDs das empresas acessíveis ao usuário atual"""
    return permission_service.get_accessible_empresas_ids(current_user)


class PermissionChecker:
    """Classe helper para verificações de permissão em endpoints"""
    
    def __init__(
        self,
        current_user: User = Depends(get_current_user),
        permission_service: PermissionService = Depends(get_permission_service)
    ):
        self.current_user = current_user
        self.permission_service = permission_service
    
    def check_empresa_access(self, empresa_id: int) -> bool:
        """Verificar acesso à empresa"""
        return self.permission_service.user_can_access_empresa(self.current_user, empresa_id)
    
    def check_empresa_management(self, empresa_id: int) -> bool:
        """Verificar permissão de gerenciar empresa"""
        return self.permission_service.user_can_manage_empresa(self.current_user, empresa_id)
    
    def check_modulo_access(self, modulo_slug: str) -> bool:
        """Verificar acesso ao módulo"""
        return self.permission_service.user_can_access_modulo(self.current_user, modulo_slug)
    
    def require_empresa_access(self, empresa_id: int):
        """Lançar exceção se não tiver acesso à empresa"""
        if not self.check_empresa_access(empresa_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Você não tem permissão para acessar dados desta empresa."
            )
    
    def require_empresa_management(self, empresa_id: int):
        """Lançar exceção se não puder gerenciar empresa"""
        if not self.check_empresa_management(empresa_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Você não tem permissão para gerenciar esta empresa."
            )
    
    def require_modulo_access(self, modulo_slug: str):
        """Lançar exceção se não tiver acesso ao módulo"""
        if not self.check_modulo_access(modulo_slug):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Você não tem permissão para acessar o módulo '{modulo_slug}'."
            )
    
    def get_accessible_empresas_ids(self) -> List[int]:
        """Obter IDs das empresas acessíveis"""
        return self.permission_service.get_accessible_empresas_ids(self.current_user)
    
    def filter_empresas_by_permission(self, empresas_ids: List[int]) -> List[int]:
        """Filtrar empresas por permissão"""
        return self.permission_service.filter_empresas_by_permission(self.current_user, empresas_ids)