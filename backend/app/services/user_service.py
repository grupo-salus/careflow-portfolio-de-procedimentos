from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate
from ..core.security import get_password_hash, verify_password
from .permission_service import PermissionService


class UserService:
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = PermissionService(db)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Buscar usuário por email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Buscar usuário por ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_users(self, skip: int = 0, limit: int = 100, only_active: bool = True) -> List[User]:
        """Listar usuários"""
        query = self.db.query(User)
        
        if only_active:
            query = query.filter(User.is_active == True)
        
        return query.offset(skip).limit(limit).all()
    
    def create_user(self, user_create: UserCreate, setup_default_permissions: bool = True) -> Optional[User]:
        """Criar novo usuário"""
        try:
            # Verificar se o usuário já existe
            existing_user = self.get_user_by_email(user_create.email)
            if existing_user:
                return None
            
            # Criar hash da senha
            hashed_password = get_password_hash(user_create.password)
            
            # Criar usuário
            db_user = User(
                email=user_create.email,
                full_name=user_create.full_name,
                hashed_password=hashed_password,
                role=user_create.role,
                is_active=True,
                is_verified=False
            )
            
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            # Configurar permissões padrão
            if setup_default_permissions:
                self.permission_service.setup_default_permissions_for_user(db_user)
            
            return db_user
            
        except IntegrityError:
            self.db.rollback()
            return None
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Autenticar usuário com email e senha"""
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Atualizar dados do usuário"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        
        # Se a senha foi fornecida, fazer o hash
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        try:
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError:
            self.db.rollback()
            return None
    
    def deactivate_user(self, user_id: int) -> bool:
        """Desativar usuário"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_active = False
        self.db.commit()
        return True
    
    def activate_user(self, user_id: int) -> bool:
        """Ativar usuário"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_active = True
        self.db.commit()
        return True
    
    def promote_to_admin(self, user_id: int) -> bool:
        """Promover usuário a admin"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.role = UserRole.ADMIN
        self.db.commit()
        
        # Configurar permissões de admin
        self.permission_service.setup_default_permissions_for_user(user)
        return True
    
    def demote_from_admin(self, user_id: int) -> bool:
        """Rebaixar admin a usuário comum"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.role = UserRole.COMUM
        self.db.commit()
        return True
    
    def get_admins(self) -> List[User]:
        """Obter todos os usuários admin"""
        return (
            self.db.query(User)
            .filter(User.role == UserRole.ADMIN)
            .filter(User.is_active == True)
            .all()
        )
    
    def count_users_by_role(self) -> dict:
        """Contar usuários por role"""
        total = self.db.query(User).count()
        admins = self.db.query(User).filter(User.role == UserRole.ADMIN).count()
        comuns = self.db.query(User).filter(User.role == UserRole.COMUM).count()
        ativos = self.db.query(User).filter(User.is_active == True).count()
        
        return {
            "total": total,
            "admins": admins,
            "comuns": comuns,
            "ativos": ativos,
            "inativos": total - ativos
        }