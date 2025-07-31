from sqlalchemy.orm import Session
from typing import List
from ..models.user import User, UserRole
from ..schemas.user import UserPermissions
from .empresa_service import EmpresaService
from .modulo_service import ModuloService


class PermissionService:
    """Serviço centralizado para gerenciar permissões de usuários"""
    
    def __init__(self, db: Session):
        self.db = db
        self.empresa_service = EmpresaService(db)
        self.modulo_service = ModuloService(db)
    
    def get_user_permissions(self, user: User) -> UserPermissions:
        """Obter todas as permissões de um usuário"""
        
        # Obter empresas do usuário
        empresas = self.empresa_service.get_empresas_by_user(user.id)
        empresas_ids = [emp.id for emp in empresas]
        
        # Obter empresas onde é admin
        empresas_admin = []
        for empresa in empresas:
            if self.empresa_service.user_is_admin_of_empresa(user.id, empresa.id):
                empresas_admin.append(empresa.id)
        
        # Obter módulos do usuário
        modulos = self.modulo_service.get_modulos_by_user(user.id, include_admin_only=user.is_admin())
        modulos_slugs = [mod.slug for mod in modulos]
        
        return UserPermissions(
            is_admin=user.is_admin(),
            empresas_ids=empresas_ids,
            modulos_slugs=modulos_slugs,
            empresas_admin=empresas_admin
        )
    
    def user_can_access_empresa(self, user: User, empresa_id: int) -> bool:
        """Verificar se usuário pode acessar dados de uma empresa"""
        # Admins gerais podem acessar todas as empresas
        if user.is_admin():
            return True
        
        # Usuários comuns só podem acessar empresas que pertencem
        return self.empresa_service.user_has_access_to_empresa(user.id, empresa_id)
    
    def user_can_manage_empresa(self, user: User, empresa_id: int) -> bool:
        """Verificar se usuário pode gerenciar uma empresa"""
        # Admins gerais podem gerenciar todas as empresas
        if user.is_admin():
            return True
        
        # Verificar se é admin específico da empresa
        return self.empresa_service.user_is_admin_of_empresa(user.id, empresa_id)
    
    def user_can_access_modulo(self, user: User, modulo_slug: str) -> bool:
        """Verificar se usuário pode acessar um módulo"""
        # Admins gerais podem acessar todos os módulos
        if user.is_admin():
            return True
        
        # Verificar acesso específico ao módulo
        return self.modulo_service.user_has_access_to_modulo(user.id, modulo_slug)
    
    def user_can_manage_users(self, user: User) -> bool:
        """Verificar se usuário pode gerenciar outros usuários"""
        # Apenas admins gerais podem gerenciar usuários
        return user.is_admin()
    
    def get_accessible_empresas_ids(self, user: User) -> List[int]:
        """Obter IDs das empresas que o usuário pode acessar"""
        if user.is_admin():
            # Admins veem todas as empresas ativas
            empresas = self.empresa_service.get_empresas(only_active=True)
            return [emp.id for emp in empresas]
        else:
            # Usuários comuns veem apenas suas empresas
            empresas = self.empresa_service.get_empresas_by_user(user.id)
            return [emp.id for emp in empresas]
    
    def filter_empresas_by_permission(self, user: User, empresas_ids: List[int]) -> List[int]:
        """Filtrar lista de empresas baseado nas permissões do usuário"""
        if user.is_admin():
            return empresas_ids
        
        # Para usuários comuns, filtrar apenas empresas que têm acesso
        user_empresas = self.get_accessible_empresas_ids(user)
        return [emp_id for emp_id in empresas_ids if emp_id in user_empresas]
    
    def setup_default_permissions_for_user(self, user: User) -> bool:
        """Configurar permissões padrão para um novo usuário"""
        try:
            # Para usuários comuns, adicionar aos módulos básicos
            if not user.is_admin():
                # Obter módulos não-admin disponíveis
                modulos_basicos = self.modulo_service.get_available_modulos_for_user_role(is_admin=False)
                
                for modulo in modulos_basicos:
                    # Adicionar apenas módulos que não são admin-only
                    if not modulo.is_admin_only:
                        self.modulo_service.add_user_to_modulo(user.id, modulo.id)
            else:
                # Para admins, adicionar a todos os módulos
                todos_modulos = self.modulo_service.get_modulos(only_active=True)
                
                for modulo in todos_modulos:
                    self.modulo_service.add_user_to_modulo(user.id, modulo.id)
            
            return True
            
        except Exception:
            return False