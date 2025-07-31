from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..models.empresa import Empresa
from ..models.associations import usuario_empresas
from ..schemas.empresa import EmpresaCreate, EmpresaUpdate


class EmpresaService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_empresa_by_id(self, empresa_id: int) -> Optional[Empresa]:
        """Buscar empresa por ID"""
        return self.db.query(Empresa).filter(Empresa.id == empresa_id).first()
    
    def get_empresa_by_nome(self, nome: str) -> Optional[Empresa]:
        """Buscar empresa por nome"""
        return self.db.query(Empresa).filter(Empresa.nome == nome).first()
    
    def get_empresas(self, skip: int = 0, limit: int = 100, only_active: bool = True) -> List[Empresa]:
        """Listar empresas"""
        query = self.db.query(Empresa)
        
        if only_active:
            query = query.filter(Empresa.is_active == True)
        
        return query.offset(skip).limit(limit).all()
    
    def create_empresa(self, empresa_create: EmpresaCreate) -> Optional[Empresa]:
        """Criar nova empresa"""
        try:
            # Verificar se empresa com mesmo nome já existe
            existing_empresa = self.get_empresa_by_nome(empresa_create.nome)
            if existing_empresa:
                return None
            
            # Criar empresa
            db_empresa = Empresa(**empresa_create.model_dump())
            
            self.db.add(db_empresa)
            self.db.commit()
            self.db.refresh(db_empresa)
            
            return db_empresa
            
        except IntegrityError:
            self.db.rollback()
            return None
    
    def update_empresa(self, empresa_id: int, empresa_update: EmpresaUpdate) -> Optional[Empresa]:
        """Atualizar dados da empresa"""
        empresa = self.get_empresa_by_id(empresa_id)
        if not empresa:
            return None
        
        update_data = empresa_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(empresa, field, value)
        
        try:
            self.db.commit()
            self.db.refresh(empresa)
            return empresa
        except IntegrityError:
            self.db.rollback()
            return None
    
    def delete_empresa(self, empresa_id: int) -> bool:
        """Desativar empresa (soft delete)"""
        empresa = self.get_empresa_by_id(empresa_id)
        if not empresa:
            return False
        
        empresa.is_active = False
        self.db.commit()
        return True
    
    def get_empresas_by_user(self, user_id: int) -> List[Empresa]:
        """Obter empresas de um usuário"""
        return (
            self.db.query(Empresa)
            .join(usuario_empresas)
            .filter(usuario_empresas.c.user_id == user_id)
            .filter(Empresa.is_active == True)
            .all()
        )
    
    def user_has_access_to_empresa(self, user_id: int, empresa_id: int) -> bool:
        """Verificar se usuário tem acesso à empresa"""
        result = (
            self.db.query(usuario_empresas)
            .filter(usuario_empresas.c.user_id == user_id)
            .filter(usuario_empresas.c.empresa_id == empresa_id)
            .first()
        )
        return result is not None
    
    def user_is_admin_of_empresa(self, user_id: int, empresa_id: int) -> bool:
        """Verificar se usuário é admin da empresa"""
        result = (
            self.db.query(usuario_empresas)
            .filter(usuario_empresas.c.user_id == user_id)
            .filter(usuario_empresas.c.empresa_id == empresa_id)
            .filter(usuario_empresas.c.is_admin_empresa == True)
            .first()
        )
        return result is not None
    
    def add_user_to_empresa(self, user_id: int, empresa_id: int, is_admin: bool = False) -> bool:
        """Adicionar usuário à empresa"""
        try:
            # Verificar se associação já existe
            existing = (
                self.db.query(usuario_empresas)
                .filter(usuario_empresas.c.user_id == user_id)
                .filter(usuario_empresas.c.empresa_id == empresa_id)
                .first()
            )
            
            if existing:
                return False  # Já existe
            
            # Inserir nova associação
            stmt = usuario_empresas.insert().values(
                user_id=user_id,
                empresa_id=empresa_id,
                is_admin_empresa=is_admin
            )
            self.db.execute(stmt)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            return False
    
    def remove_user_from_empresa(self, user_id: int, empresa_id: int) -> bool:
        """Remover usuário da empresa"""
        try:
            stmt = usuario_empresas.delete().where(
                (usuario_empresas.c.user_id == user_id) &
                (usuario_empresas.c.empresa_id == empresa_id)
            )
            result = self.db.execute(stmt)
            self.db.commit()
            return result.rowcount > 0
        except Exception:
            self.db.rollback()
            return False