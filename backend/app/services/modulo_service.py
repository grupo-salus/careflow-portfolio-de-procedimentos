from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..models.modulo import Modulo
from ..models.associations import usuario_modulos
from ..schemas.modulo import ModuloCreate, ModuloUpdate


class ModuloService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_modulo_by_id(self, modulo_id: int) -> Optional[Modulo]:
        """Buscar módulo por ID"""
        return self.db.query(Modulo).filter(Modulo.id == modulo_id).first()
    
    def get_modulo_by_slug(self, slug: str) -> Optional[Modulo]:
        """Buscar módulo por slug"""
        return self.db.query(Modulo).filter(Modulo.slug == slug).first()
    
    def get_modulos(self, skip: int = 0, limit: int = 100, only_active: bool = True) -> List[Modulo]:
        """Listar módulos ordenados"""
        query = self.db.query(Modulo)
        
        if only_active:
            query = query.filter(Modulo.is_active == True)
        
        return query.order_by(Modulo.ordem, Modulo.nome).offset(skip).limit(limit).all()
    
    def create_modulo(self, modulo_create: ModuloCreate) -> Optional[Modulo]:
        """Criar novo módulo"""
        try:
            # Verificar se módulo com mesmo slug já existe
            existing_modulo = self.get_modulo_by_slug(modulo_create.slug)
            if existing_modulo:
                return None
            
            # Criar módulo
            db_modulo = Modulo(**modulo_create.model_dump())
            
            self.db.add(db_modulo)
            self.db.commit()
            self.db.refresh(db_modulo)
            
            return db_modulo
            
        except IntegrityError:
            self.db.rollback()
            return None
    
    def update_modulo(self, modulo_id: int, modulo_update: ModuloUpdate) -> Optional[Modulo]:
        """Atualizar dados do módulo"""
        modulo = self.get_modulo_by_id(modulo_id)
        if not modulo:
            return None
        
        update_data = modulo_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(modulo, field, value)
        
        try:
            self.db.commit()
            self.db.refresh(modulo)
            return modulo
        except IntegrityError:
            self.db.rollback()
            return None
    
    def delete_modulo(self, modulo_id: int) -> bool:
        """Desativar módulo (soft delete)"""
        modulo = self.get_modulo_by_id(modulo_id)
        if not modulo:
            return False
        
        modulo.is_active = False
        self.db.commit()
        return True
    
    def get_modulos_by_user(self, user_id: int, include_admin_only: bool = False) -> List[Modulo]:
        """Obter módulos de um usuário"""
        query = (
            self.db.query(Modulo)
            .join(usuario_modulos)
            .filter(usuario_modulos.c.user_id == user_id)
            .filter(Modulo.is_active == True)
        )
        
        if not include_admin_only:
            query = query.filter(Modulo.is_admin_only == False)
        
        return query.order_by(Modulo.ordem, Modulo.nome).all()
    
    def user_has_access_to_modulo(self, user_id: int, modulo_slug: str) -> bool:
        """Verificar se usuário tem acesso ao módulo"""
        result = (
            self.db.query(usuario_modulos)
            .join(Modulo, usuario_modulos.c.modulo_id == Modulo.id)
            .filter(usuario_modulos.c.user_id == user_id)
            .filter(Modulo.slug == modulo_slug)
            .filter(Modulo.is_active == True)
            .first()
        )
        return result is not None
    
    def add_user_to_modulo(self, user_id: int, modulo_id: int) -> bool:
        """Adicionar usuário ao módulo"""
        try:
            # Verificar se associação já existe
            existing = (
                self.db.query(usuario_modulos)
                .filter(usuario_modulos.c.user_id == user_id)
                .filter(usuario_modulos.c.modulo_id == modulo_id)
                .first()
            )
            
            if existing:
                return False  # Já existe
            
            # Inserir nova associação
            stmt = usuario_modulos.insert().values(
                user_id=user_id,
                modulo_id=modulo_id
            )
            self.db.execute(stmt)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            return False
    
    def remove_user_from_modulo(self, user_id: int, modulo_id: int) -> bool:
        """Remover usuário do módulo"""
        try:
            stmt = usuario_modulos.delete().where(
                (usuario_modulos.c.user_id == user_id) &
                (usuario_modulos.c.modulo_id == modulo_id)
            )
            result = self.db.execute(stmt)
            self.db.commit()
            return result.rowcount > 0
        except Exception:
            self.db.rollback()
            return False
    
    def get_available_modulos_for_user_role(self, is_admin: bool) -> List[Modulo]:
        """Obter módulos disponíveis baseado no role do usuário"""
        query = self.db.query(Modulo).filter(Modulo.is_active == True)
        
        if not is_admin:
            # Usuários comuns não podem acessar módulos admin-only
            query = query.filter(Modulo.is_admin_only == False)
        
        return query.order_by(Modulo.ordem, Modulo.nome).all()